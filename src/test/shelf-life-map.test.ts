import { describe, expect, it } from "vitest";
import { matchesMapFilter } from "@/lib/shelf-life-map";

describe("ShelfLife map filters", () => {
  it("shows every business kind for All", () => {
    expect(matchesMapFilter("Storage", "All")).toBe(true);
    expect(matchesMapFilter("Distributor", "All")).toBe(true);
    expect(matchesMapFilter("Vendor", "All")).toBe(true);
  });

  it("shows only storage centres for Storage Centres", () => {
    expect(matchesMapFilter("Storage", "Storage Centres")).toBe(true);
    expect(matchesMapFilter("Distributor", "Storage Centres")).toBe(false);
    expect(matchesMapFilter("Vendor", "Storage Centres")).toBe(false);
  });

  it("shows only distributors for Distributors", () => {
    expect(matchesMapFilter("Storage", "Distributors")).toBe(false);
    expect(matchesMapFilter("Distributor", "Distributors")).toBe(true);
    expect(matchesMapFilter("Vendor", "Distributors")).toBe(false);
  });

  it("shows only vendors for Vendors", () => {
    expect(matchesMapFilter("Storage", "Vendors")).toBe(false);
    expect(matchesMapFilter("Distributor", "Vendors")).toBe(false);
    expect(matchesMapFilter("Vendor", "Vendors")).toBe(true);
  });
});