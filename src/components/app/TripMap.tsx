import { useEffect, useRef } from "react";
import type { Map as LMap, LayerGroup } from "leaflet";

type Pt = { lat: number; lng: number };
type Props = { pickup?: Pt | null; dropoff?: Pt | null; hauler?: Pt | null; className?: string };

const LAGOS: [number, number] = [6.5244, 3.3792];

function dot(color: string, label: string) {
  return `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:${color};color:#fff;font:700 11px Manrope,sans-serif;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">${label}</div>`;
}

export function TripMap({ pickup, dropoff, hauler, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      L.current = mod;
      map.current = mod.map(el.current, { zoomControl: false, attributionControl: true }).setView(LAGOS, 11);
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map.current);
      layer.current = mod.layerGroup().addTo(map.current);
      draw();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const mod = L.current;
    if (!mod || !map.current || !layer.current) return;
    layer.current.clearLayers();
    const pts: [number, number][] = [];
    const add = (p: Pt, html: string) => {
      mod.marker([p.lat, p.lng], { icon: mod.divIcon({ html, className: "", iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(layer.current!);
      pts.push([p.lat, p.lng]);
    };
    if (pickup) add(pickup, dot("#111", "A"));
    if (dropoff) add(dropoff, dot("#15803d", "B"));
    if (pickup && dropoff) {
      mod.polyline([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]], { color: "#111", weight: 4, dashArray: "1 8", lineCap: "round" }).addTo(layer.current);
    }
    if (hauler) add(hauler, dot("#ea580c", "H"));
    if (pts.length === 1) map.current.setView(pts[0], 13);
    else if (pts.length > 1) map.current.fitBounds(pts, { padding: [60, 60] });
  }

  useEffect(draw, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, hauler?.lat, hauler?.lng]);

  return <div ref={el} className={className} aria-label="Map" role="region" />;
}
