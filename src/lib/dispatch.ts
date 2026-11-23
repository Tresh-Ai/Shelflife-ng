export type Place = { id: string; name: string; area: string; lat: number; lng: number };

export const HUBS: Place[] = [
  { id: "mile12", name: "Mile 12 Market", area: "Kosofe", lat: 6.6036, lng: 3.3967 },
  { id: "ketu", name: "Ketu Fruit Market", area: "Ketu", lat: 6.5965, lng: 3.3891 },
  { id: "oyingbo", name: "Oyingbo Market", area: "Ebute Metta", lat: 6.4855, lng: 3.3849 },
  { id: "ikotun", name: "Ikotun Market", area: "Alimosho", lat: 6.5498, lng: 3.2649 },
  { id: "badagry", name: "Badagry Farm Gate", area: "Badagry", lat: 6.4316, lng: 2.8876 },
  { id: "epe", name: "Epe Produce Hub", area: "Epe", lat: 6.5841, lng: 3.9834 },
  { id: "lekki", name: "Lekki Phase 1", area: "Lekki", lat: 6.4474, lng: 3.4723 },
  { id: "ikeja", name: "Ikeja GRA", area: "Ikeja", lat: 6.5818, lng: 3.3561 },
  { id: "yaba", name: "Yaba Tech Market", area: "Yaba", lat: 6.5158, lng: 3.3719 },
  { id: "vi", name: "Victoria Island", area: "Eti-Osa", lat: 6.4281, lng: 3.4219 },
];

export type VehicleId = "bike" | "van" | "cold";
export type Vehicle = { id: VehicleId; name: string; note: string; maxCrates: number; base: number; perKm: number; kmh: number };

export const VEHICLES: Vehicle[] = [
  { id: "bike", name: "Cargo bike", note: "Up to 6 crates, fastest", maxCrates: 6, base: 1500, perKm: 250, kmh: 28 },
  { id: "van", name: "Mini van", note: "Up to 40 crates", maxCrates: 40, base: 4000, perKm: 450, kmh: 24 },
  { id: "cold", name: "Cold truck", note: "Up to 200 crates, chilled", maxCrates: 200, base: 9000, perKm: 800, kmh: 20 },
];

export const PRODUCE = ["Tomatoes", "Peppers", "Leafy greens", "Onions", "Plantain", "Yams", "Fruits"];

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  // Roads are longer than straight lines; 1.3 is a common urban detour factor.
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.3 * 10) / 10;
}

export function quote(vehicle: Vehicle, km: number, crates: number) {
  const price = Math.round((vehicle.base + vehicle.perKm * km + 50 * crates) / 100) * 100;
  const minutes = Math.max(10, Math.round((km / vehicle.kmh) * 60));
  return { price, minutes };
}

export function vehicleFits(vehicle: Vehicle, crates: number) {
  return crates >= 1 && crates <= vehicle.maxCrates;
}

export const STATUS_LABEL: Record<string, string> = {
  searching: "Finding a hauler",
  accepted: "Hauler on the way",
  picked_up: "In transit",
  arrived: "Driver has arrived",
  paid: "Paid, awaiting handover",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
