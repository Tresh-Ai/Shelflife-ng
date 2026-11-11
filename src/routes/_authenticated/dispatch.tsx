import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bike, Truck, Snowflake, Minus, Plus, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { TripMap } from "@/components/app/TripMap";
import { HUBS, PRODUCE, VEHICLES, distanceKm, quote, vehicleFits, naira, type Place, type VehicleId } from "@/lib/dispatch";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dispatch")({
  head: () => ({ meta: [{ title: "Request a hauler — ShelfLife" }, { name: "description", content: "Book a produce hauler." }] }),
  component: Dispatch,
});

const ICON = { bike: Bike, van: Truck, cold: Snowflake } as const;

function Dispatch() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [produce, setProduce] = useState<string>(PRODUCE[0] ?? "Tomatoes");
  const [crates, setCrates] = useState(4);
  const [vehicle, setVehicle] = useState<VehicleId>("bike");
  const [busy, setBusy] = useState(false);

  const km = pickup && dropoff ? distanceKm(pickup, dropoff) : 0;
  const quotes = useMemo(() => VEHICLES.map((v) => ({ v, ...quote(v, km, crates), fits: vehicleFits(v, crates) })), [km, crates]);
  const chosen = quotes.find((q) => q.v.id === vehicle)!;

  function locate() {
    if (!navigator.geolocation) { toast.error("Location not available on this device"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setPickup({ id: "me", name: "My location", area: "Current position", lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Allow location access to use this"),
    );
  }

  function pick(set: (p: Place | null) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => set(HUBS.find((h) => h.id === e.target.value) ?? null);
  }

  async function request() {
    if (!pickup || !dropoff) return;
    if (!chosen.fits) { toast.error(`${chosen.v.name} takes up to ${chosen.v.maxCrates} crates`); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("trips").insert({
      buyer_id: u.user!.id,
      pickup_name: pickup.name, pickup_lat: pickup.lat, pickup_lng: pickup.lng,
      dropoff_name: dropoff.name, dropoff_lat: dropoff.lat, dropoff_lng: dropoff.lng,
      produce, crates, vehicle, distance_km: km, price_ngn: chosen.price,
    }).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/trips/$id", params: { id: data.id } });
  }

  const sel = "h-12 w-full appearance-none rounded-xl bg-muted pl-10 pr-3 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-ring";
  const ready = pickup && dropoff && pickup.id !== dropoff.id;

  return (
    <div>
      <TripMap pickup={pickup} dropoff={dropoff} className="h-[38dvh] w-full" />
      <section className="relative z-[500] -mt-5 rounded-t-3xl bg-card px-5 pt-3 pb-6 shadow-[var(--shadow-sheet)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h1 className="text-2xl font-extrabold tracking-tight">Where is it going?</h1>

        <div className="mt-4 space-y-2">
          <div className="relative">
            <span className="absolute top-1/2 left-4 size-2.5 -translate-y-1/2 rounded-full bg-foreground" />
            {pickup?.id === "me" ? (
              <div className={sel + " flex items-center"}>My location <button onClick={() => setPickup(null)} className="ml-auto text-xs text-muted-foreground underline">change</button></div>
            ) : (
              <select aria-label="Pickup" className={sel} value={pickup?.id ?? ""} onChange={pick(setPickup)}>
                <option value="">Pickup point</option>
                {HUBS.map((h) => <option key={h.id} value={h.id}>{h.name} · {h.area}</option>)}
              </select>
            )}
            {pickup?.id !== "me" && (
              <button onClick={locate} aria-label="Use my location" className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg bg-card"><LocateFixed className="size-4" /></button>
            )}
          </div>
          <div className="relative">
            <span className="absolute top-1/2 left-4 size-2.5 -translate-y-1/2 rounded-[3px] bg-success" />
            <select aria-label="Drop-off" className={sel} value={dropoff?.id ?? ""} onChange={pick(setDropoff)}>
              <option value="">Drop-off point</option>
              {HUBS.map((h) => <option key={h.id} value={h.id}>{h.name} · {h.area}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {PRODUCE.map((p) => (
            <button key={p} onClick={() => setProduce(p)} aria-pressed={produce === p}
              className={"shrink-0 rounded-full px-4 py-2 text-sm font-semibold " + (produce === p ? "bg-primary text-primary-foreground" : "bg-muted")}>{p}</button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
          <span className="text-[15px] font-semibold">Crates</span>
          <div className="flex items-center gap-4">
            <button aria-label="Fewer crates" onClick={() => setCrates((c) => Math.max(1, c - 1))} className="grid size-9 place-items-center rounded-full bg-card"><Minus className="size-4" /></button>
            <span className="w-8 text-center text-lg font-extrabold tabular-nums">{crates}</span>
            <button aria-label="More crates" onClick={() => setCrates((c) => Math.min(200, c + 1))} className="grid size-9 place-items-center rounded-full bg-card"><Plus className="size-4" /></button>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {quotes.map(({ v, price, minutes, fits }) => {
            const Icon = ICON[v.id];
            const on = vehicle === v.id;
            return (
              <li key={v.id}>
                <button disabled={!fits} onClick={() => setVehicle(v.id)} aria-pressed={on}
                  className={"flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition disabled:opacity-40 " + (on ? "border-foreground" : "border-transparent bg-muted")}>
                  <span className="grid size-11 place-items-center rounded-lg bg-card"><Icon className="size-5" /></span>
                  <span className="flex-1">
                    <span className="block font-bold">{v.name}</span>
                    <span className="block text-xs text-muted-foreground">{fits ? v.note : `Max ${v.maxCrates} crates`}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-extrabold tabular-nums">{ready ? naira(price) : "—"}</span>
                    <span className="block text-xs text-muted-foreground">{ready ? `${minutes} min` : ""}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button onClick={request} disabled={!ready || busy || !chosen.fits}
          className="mt-5 h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-40">
          {busy ? "Requesting…" : ready ? `Request ${chosen.v.name} · ${naira(chosen.price)}` : "Choose pickup and drop-off"}
        </button>
        {ready && <p className="mt-2 text-center text-xs text-muted-foreground">{km} km by road (estimate)</p>}
      </section>
    </div>
  );
}
