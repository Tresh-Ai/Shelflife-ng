import { describe, expect, it } from "vitest";
import { cartTotal, setLineQty, type CartLine } from "@/lib/catalog";

const line: Omit<CartLine, "qty"> = {
  product_id: "p1", name: "Ata rodo", unit: "paint bucket", price_ngn: 1200,
  market_id: "mile12", seller_id: "s1", category: "Tomatoes", image_url: null,
};

describe("basket rules", () => {
  it("adds bulk quantity to a line", () => {
    expect(setLineQty([], line, 11, 40)[0]!.qty).toBe(11);
  });

  it("never lets you take more than the seller has in stock", () => {
    expect(setLineQty([], line, 90, 7)[0]!.qty).toBe(7);
  });

  it("drops a line when the quantity goes to zero", () => {
    expect(setLineQty(setLineQty([], line, 5, 40), line, 0, 40)).toEqual([]);
  });

  it("keeps every line's own price in the total", () => {
    const lines = setLineQty([], line, 2, 40);
    expect(cartTotal([...lines, { ...line, product_id: "p2", price_ngn: 500, qty: 3 }])).toBe(2400 + 1500);
  });
});
