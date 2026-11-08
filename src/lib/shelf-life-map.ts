export type BusinessKind = "Storage" | "Distributor" | "Vendor";
export type MapFilter = "All" | "Storage Centres" | "Distributors" | "Vendors";

export function matchesMapFilter(kind: BusinessKind, filter: MapFilter) {
  return filter === "All" ||
    (filter === "Storage Centres" && kind === "Storage") ||
    (filter === "Distributors" && kind === "Distributor") ||
    (filter === "Vendors" && kind === "Vendor");
}