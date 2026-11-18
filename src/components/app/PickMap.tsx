import { useEffect, useRef } from "react";
import type { Map as LMap } from "leaflet";

type Pt = { lat: number; lng: number };
const LAGOS: [number, number] = [6.5244, 3.3792];

function pin(color: string) {
  return `<div style="width:22px;height:22px;border-radius:999px;background:${color};border:4px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.4)"></div>`;
}

/** Map you tap to choose an exact spot. Leaflet loads inside an effect so SSR never imports it. */
export function PickMap({ point, onPick, className }: { point: Pt | null; onPick: (p: Pt) => void; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const mark = useRef<ReturnType<typeof import("leaflet").marker> | null>(null);
  const cb = useRef(onPick);
  cb.current = onPick;

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      L.current = mod;
      map.current = mod.map(el.current, { zoomControl: true }).setView(point ? [point.lat, point.lng] : LAGOS, point ? 15 : 11);
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(map.current);
      map.current.on("click", (e: { latlng: { lat: number; lng: number } }) => cb.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
      if (point) draw();
    });
    return () => {
      cancelled = true;
      mark.current = null;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const mod = L.current;
    if (!mod || !map.current) return;
    mark.current?.remove();
    if (!point) return;
    mark.current = mod
      .marker([point.lat, point.lng], { icon: mod.divIcon({ html: pin("#c2410c"), className: "", iconSize: [22, 22], iconAnchor: [11, 11] }) })
      .addTo(map.current);
  }
  useEffect(draw, [point?.lat, point?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={className} role="region" aria-label="Tap the map to choose a spot" />;
}
