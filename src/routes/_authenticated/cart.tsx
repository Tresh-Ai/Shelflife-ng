import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cartTotal } from "@/lib/catalog";
import { naira } from "@/lib/dispatch";
import { useCart, useMarkets } from "@/lib/shop";
import { useUserId } from "@/lib/trips";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Your basket — ShelfLife" }, { name: "description", content: "Review your bulk order and check out." }] }),
  component: Cart,
});

function Cart() {
  const cart = useCart();
  const me = useUserId();
  const qc = useQueryClient();
  const { data: markets } = useMarkets();
  const [busy, setBusy] = useState(false);
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", "mine", me], enabled: !!me,
    queryFn: async () => (await supabase.from("orders").select("*").eq("buyer_id", me!).order("created_at", { ascending: false }).limit(20)).data ?? [],
  });
  const mName = (id: string) => markets?.find((m) => m.id === id)?.name ?? id;

  async function checkout() {
    setBusy(true);
    const { error } = await supabase.rpc("place_order", { _items: cart.lines.map((l) => ({ product_id: l.product_id, qty: l.qty })) });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    cart.clear();
    toast.success("Order placed. Book a hauler to move it.");
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <main className="px-4 pt-6 pb-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Basket</h1>
      {cart.lines.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-muted p-6 text-center">
          <p className="font-semibold">Your basket is empty.</p>
          <Link to="/shop" className="mt-3 inline-block font-bold underline">Go to shop</Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y rounded-2xl border bg-card">
            {cart.lines.map((l) => (
              <li key={l.product_id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{mName(l.market_id)} · {naira(l.price_ngn)}/{l.unit}</p>
                  <p className="mt-1 text-sm font-extrabold">{naira(l.price_ngn * l.qty)}</p>
                </div>
                <div className="flex items-center rounded-lg bg-muted">
                  <button aria-label="Less" className="grid size-9 place-items-center" onClick={() => cart.set(l, l.qty - 1, 1e9)}><Minus className="size-4" /></button>
                  <span className="w-8 text-center font-bold">{l.qty}</span>
                  <button aria-label="More" className="grid size-9 place-items-center" onClick={() => cart.set(l, l.qty + 1, 1e9)}><Plus className="size-4" /></button>
                </div>
                <button aria-label="Remove" onClick={() => cart.set(l, 0, 0)} className="text-muted-foreground"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between text-lg font-extrabold"><span>Total</span><span>{naira(cartTotal(cart.lines))}</span></div>
          <button disabled={busy} onClick={checkout} className="mt-4 h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60">
            {busy ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Pay the seller on pickup. Stock is held for you once you order.</p>
        </>
      )}
      {orders.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Your orders</h2>
            <Link to="/dispatch" className="text-sm font-bold underline">Book a hauler</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="rounded-xl border bg-card p-3">
                <div className="flex justify-between text-sm font-bold"><span>{mName(o.market_id)}</span><span>{naira(o.total_ngn)}</span></div>
                <p className="mt-1 text-xs text-muted-foreground">{(o.items as { name: string; qty: number; unit: string }[]).map((i) => `${i.qty} ${i.unit} ${i.name}`).join(", ")}</p>
                <p className="mt-1 text-xs font-semibold capitalize">{o.status}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
