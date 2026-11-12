import { useEffect, useRef } from "react";
import type { Map as LMap, LayerGroup } from "leaflet";

export type MapPlace = { id: string; name: string; lat: number; lng: number };
type Props = { places: MapPlace[]; selected?: string | null; me?: { lat: number; lng: number } | null; onSelect?: (id: string) => void; className?: string };

export function PlacesMap({ places, selected, me, onSelect, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const sel = useRef(onSelect); sel.current = onSelect;

  useEffect(() => {
    let off = false;
    import("leaflet").then((mod) => {
      if (off || !el.current || map.current) return;
      L.current = mod;
      map.current = mod.map(el.current, { zoomControl: false }).setView([6.5244, 3.3792], 10);
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(map.current);
      layer.current = mod.layerGroup().addTo(map.current);
      draw(true);
    });
    return () => { off = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(fit = false) {
    const mod = L.current;
    if (!mod || !map.current || !layer.current) return;
    layer.current.clearLayers();
    for (const p of places) {
      const on = p.id === selected;
      const html = `<div style="width:${on ? 22 : 16}px;height:${on ? 22 : 16}px;border-radius:999px;background:${on ? "#c2410c" : "#14532d"};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`;
      mod.marker([p.lat, p.lng], { title: p.name, icon: mod.divIcon({ html, className: "", iconSize: [22, 22], iconAnchor: [11, 11] }) })
        .on("click", () => sel.current?.(p.id)).bindTooltip(p.name).addTo(layer.current);
    }
    if (me) mod.circleMarker([me.lat, me.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).addTo(layer.current);
    const s = places.find((p) => p.id === selected);
    if (s) map.current.setView([s.lat, s.lng], 13);
    else if (fit && places.length) map.current.fitBounds(places.map((p) => [p.lat, p.lng] as [number, number]), { padding: [40, 40] });
  }
  useEffect(() => draw(), [places, selected, me?.lat, me?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={className} role="region" aria-label="Map" />;
}
