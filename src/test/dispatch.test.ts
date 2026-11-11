import { describe, expect, it } from "vitest";
import { VEHICLES, quote, vehicleFits, distanceKm } from "@/lib/dispatch";

const bike = VEHICLES.find((v) => v.id === "bike")!;
const van = VEHICLES.find((v) => v.id === "van")!;

describe("dispatch pricing", () => {
  it("prices a 10 km van trip with 10 crates at base + per km + per crate", () => {
    expect(quote(van, 10, 10).price).toBe(9000);
  });
  it("cargo bike cannot take more than 6 crates", () => {
    expect(vehicleFits(bike, 7)).toBe(false);
    expect(vehicleFits(bike, 6)).toBe(true);
  });
  it("distance between the same point is zero", () => {
    expect(distanceKm({ lat: 6.5, lng: 3.3 }, { lat: 6.5, lng: 3.3 })).toBe(0);
  });
});
