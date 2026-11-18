import { useEffect, useState } from "react";
import { ArrowLeft, LocateFixed, MapPin, Search, X } from "lucide-react";
import { PickMap } from "@/components/app/PickMap";
import { nameFor, searchPlaces } from "@/lib/geo";
import type { Place } from "@/lib/dispatch";

type Props = {
  title: string;
  hubs: Place[];
  markets: Place[];
  onPick: (p: Place) => void;
  onClose: () => void;
};

/** Full-screen place chooser: type an address, use your position, or tap the map for an exact spot. */
export function PlacePicker({ title, hubs, markets, onPick, onClose }: Props) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [pin, setPin] = useState<Place | null>(null);
  const [mapMode, setMapMode] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.trim().length < 3) { setHits([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      setHits(await searchPlaces(q));
      setSearching(false);
    }, 550);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  function locate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => onPick({ id: "me", name: "My location", area: "Current position", lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
    );
  }

  async function confirmPin() {
    if (!pin) return;
    setBusy(true);
    const full = await nameFor(pin.lat, pin.lng);
    const [name, ...rest] = full.split(" · ");
    setBusy(false);
    onPick({ id: pin.id, name: name || "Dropped pin", area: rest.join(" · "), lat: pin.lat, lng: pin.lng });
  }

  const row = "flex w-full items-center gap-3 px-4 py-3 text-left";
  const dot = "size-2.5 shrink-0 rounded-full bg-foreground";

  return (
    <div className="fixed inset-0 z-[1200] flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <button onClick={onClose} aria-label="Close place chooser" className="grid size-9 place-items-center rounded-full bg-muted">
          <ArrowLeft className="size-4" />
        </button>
        <h2 className="flex-1 truncate font-extrabold">{title}</h2>
        {mapMode && (
          <button onClick={() => setMapMode(false)} className="grid size-9 place-items-center rounded-full bg-muted" aria-label="Back to list">
            <X className="size-4" />
          </button>
        )}
      </header>

      {!mapMode && (
        <div className="border-b bg-card px-4 py-3">
          <label className="flex h-11 items-center gap-2 rounded-xl bg-muted px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              className="w-full bg-transparent text-[15px] outline-none"
              placeholder="Type an address, estate or landmark"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>
      )}

      {mapMode ? (
        <>
          <PickMap
            className="min-h-0 flex-1 w-full"
            point={pin}
            onPick={(p) => setPin({ id: `geo-${p.lat.toFixed(5)}-${p.lng.toFixed(5)}`, name: "Dropped pin", area: "", lat: p.lat, lng: p.lng })}
          />
          <div className="border-t bg-card px-4 py-3">
            <p className="text-sm font-bold">{pin ? pin.name : "Tap the map where you are"}</p>
            <p className="text-xs text-muted-foreground">{pin ? "We name it for you" : "Move the map, then tap once"}</p>
            <button
              onClick={confirmPin}
              disabled={!pin || busy}
              className="mt-3 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-40"
            >
              {busy ? "Naming this spot…" : pin ? "Use this spot" : "Tap the map first"}
            </button>
          </div>
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          {q.trim().length >= 3 && (
            <div className="border-b">
              {searching && <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>}
              {!searching && hits.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">No match. Try a shorter name or drop a pin.</p>}
              {hits.map((h) => (
                <button key={h.id} onClick={() => onPick(h)} className={row}>
                  <span className={dot} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{h.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{h.area}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <button onClick={locate} className={row + " border-b"}>
            <LocateFixed className="size-4 shrink-0" />
            <span className="font-semibold">Use my current position</span>
          </button>

          <button onClick={() => setMapMode(true)} className={row + " border-b"}>
            <MapPin className="size-4 shrink-0" />
            <span className="font-semibold">Drop a pin on the map</span>
          </button>

          <p className="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Markets and hubs</p>
          {markets.map((m) => (
            <button key={m.id} onClick={() => onPick(m)} className={row}>
              <span className={dot} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{m.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{m.area}</span>
              </span>
            </button>
          ))}
          <p className="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Other hubs</p>
          {hubs.map((m) => (
            <button key={m.id} onClick={() => onPick(m)} className={row}>
              <span className={dot} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{m.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{m.area}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
