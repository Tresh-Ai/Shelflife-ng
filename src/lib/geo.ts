import type { Place } from "@/lib/dispatch";

const NOMINATIM = "https://nominatim.openstreetmap.org";

/**
 * Free address search (OpenStreetMap) so people can set any pickup or drop-off
 * point, not only the markets and hubs we list. Nigeria only, to keep results relevant.
 */
export async function searchPlaces(q: string): Promise<Place[]> {
  const term = q.trim();
  if (term.length < 3) return [];
  const url = `${NOMINATIM}/search?format=jsonv2&limit=6&countrycodes=ng&accept-language=en&q=${encodeURIComponent(term)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const rows = (await res.json()) as { display_name: string; lat: string; lon: string }[];
    return rows.map((r) => {
      const parts = r.display_name.split(",").map((s) => s.trim());
      const lat = Number(r.lat);
      const lng = Number(r.lon);
      return {
        id: `geo-${lat.toFixed(5)}-${lng.toFixed(5)}`,
        name: parts[0] ?? r.display_name,
        area: parts.slice(1, 3).join(", "),
        lat,
        lng,
      };
    });
  } catch {
    return [];
  }
}

/** Nearest readable name for a point someone dropped on the map. */
export async function nameFor(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return "Dropped pin";
    const j = (await res.json()) as { display_name?: string; address?: Record<string, string> };
    const a = j.address ?? {};
    const name = a["road"] ?? a["neighbourhood"] ?? a["village"] ?? a["town"] ?? a["suburb"] ?? a["city_district"] ?? a["county"];
    const area = [a["state"], a["country"]].filter(Boolean).join(", ");
    if (name) return `${name}${area ? " · " + area : ""}`;
    return j.display_name ?? "Dropped pin";
  } catch {
    return "Dropped pin";
  }
}
