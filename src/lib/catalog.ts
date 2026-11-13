import tomatoes from "@/assets/produce-tomatoes.jpg";
import tubers from "@/assets/produce-tubers.jpg";
import fruits from "@/assets/produce-fruits.jpg";
import vegetables from "@/assets/produce-vegetables.jpg";
import grains from "@/assets/produce-grains.jpg";

export const CATEGORIES = [
  { id: "Tomatoes", image: tomatoes, label: "Tomatoes & peppers" },
  { id: "Vegetables", image: vegetables },
  { id: "Fruits", image: fruits },
  { id: "Tubers", image: tubers },
  { id: "Grains", image: grains },
  { id: "Oils & spices", image: grains },
] as const;
export type Category = (typeof CATEGORIES)[number]["id"];

export const categoryImage = (c: string) => CATEGORIES.find((x) => x.id === c)?.image ?? vegetables;

export const UNITS = ["bag", "basket", "crate", "tuber", "bunch", "kg", "paint bucket"] as const;

export type Role = "buyer" | "driver" | "seller";
export const ROLES: { id: Role; title: string; note: string }[] = [
  { id: "buyer", title: "Buy produce", note: "Shop from markets and stores, then book delivery" },
  { id: "driver", title: "Drive and deliver", note: "Take delivery jobs. You can still book too" },
  { id: "seller", title: "Sell produce", note: "List your stock and get orders" },
];

export type SellerType = "farmer" | "storage" | "distributor" | "vendor";
export const SELLER_TYPES: { id: SellerType; title: string; note: string }[] = [
  { id: "farmer", title: "Farmer", note: "You grow it" },
  { id: "storage", title: "Storage / warehouse", note: "You keep stock for others" },
  { id: "distributor", title: "Distributor", note: "You buy in bulk and supply" },
  { id: "vendor", title: "Vendor", note: "You sell at a market stall or shop" },
];

export type CartLine = {
  product_id: string; name: string; unit: string; price_ngn: number; qty: number;
  market_id: string; seller_id: string; category: string; image_url: string | null;
};

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.price_ngn * l.qty, 0);
}

/** Add qty to a line, never exceeding stock; qty <= 0 removes the line. */
export function setLineQty(lines: CartLine[], line: Omit<CartLine, "qty">, qty: number, stock: number): CartLine[] {
  const q = Math.min(Math.max(0, Math.floor(qty)), stock);
  const rest = lines.filter((l) => l.product_id !== line.product_id);
  return q === 0 ? rest : [...rest, { ...line, qty: q }];
}
