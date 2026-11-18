import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, PlugZap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, UNITS } from "@/lib/catalog";
import { naira } from "@/lib/dispatch";
import { useContacts } from "@/lib/contacts";
import { useMarkets } from "@/lib/shop";
import { useUserId } from "@/lib/trips";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({ meta: [{ title: "Sell — ShelfLife" }, { name: "description", content: "List your stock and manage orders." }] }),
  component: Sell,
});

function Sell() {
  const me = useUserId();
  const qc = useQueryClient();
  const { data: markets } = useMarkets();
  const [f, setF] = useState({ name: "", category: "Vegetables", unit: "bag", price: "", qty: "", market: "mile12" });
  const { data: mine = [] } = useQuery({
    queryKey: ["products", "mine", me], enabled: !!me,
    queryFn: async () => (await supabase.from("products").select("*").eq("seller_id", me!).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", "selling", me], enabled: !!me,
    queryFn: async () => (await supabase.from("orders").select("*").eq("seller_id", me!).order("created_at", { ascending: false })).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });
  const contact = useContacts(orders.map((o) => o.buyer_id));
  // The delivery carrying each order, so the seller can follow a buyer's trip.
  const { data: orderTrips = [] } = useQuery({
    queryKey: ["trips", "carrying", me, orders.map((o) => o.id).join(",")],
    enabled: orders.length > 0,
    queryFn: async () => (await supabase.from("trips").select("id, order_ids, status")
      .overlaps("order_ids", orders.map((o) => o.id))).data ?? [],
  });
  const tripFor = (orderId: string) => orderTrips.find((t) => t.order_ids.includes(orderId));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("products").insert({
      seller_id: me!, name: f.name, category: f.category, unit: f.unit, market_id: f.market,
      price_ngn: Math.round(Number(f.price)), quantity: Math.round(Number(f.qty)),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Listed"); setF({ ...f, name: "", price: "", qty: "" }); refresh();
  }
  async function setQty(id: string, quantity: number) {
    const { error } = await supabase.from("products").update({ quantity: Math.max(0, quantity), updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }
  async function setStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  const input = "h-11 w-full rounded-xl bg-muted px-3 text-[15px] outline-none focus:ring-2 focus:ring-ring";
  return (
    <main className="px-4 pt-6 pb-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Your stock</h1>
      <div className="mt-4 flex gap-3 rounded-2xl border border-dashed p-4">
        <PlugZap className="mt-0.5 size-5 shrink-0" />
        <div><p className="font-bold">Connect your inventory system <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[11px]">Coming soon</span></p>
          <p className="text-sm text-muted-foreground">Warehouses and storage centres will sync stock automatically as crates come in and go out.</p></div>
      </div>

      <form onSubmit={add} className="mt-6 space-y-2.5 rounded-2xl border bg-card p-4">
        <h2 className="font-extrabold">List produce</h2>
        <input className={input} placeholder="e.g. Yam tubers (Benue)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <div className="grid grid-cols-2 gap-2">
          <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}</select>
          <select className={input} value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
          <input className={input} inputMode="numeric" placeholder="Price ₦ per unit" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} required />
          <input className={input} inputMode="numeric" placeholder="Quantity" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value.replace(/\D/g, "") })} required />
        </div>
        <select className={input} value={f.market} onChange={(e) => setF({ ...f, market: e.target.value })}>{markets?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <button className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground">Add listing</button>
      </form>

      <h2 className="mt-8 text-xl font-extrabold">Listings</h2>
      {mine.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No listings yet.</p>}
      <ul className="mt-3 space-y-2">
        {mine.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <div className="min-w-0 flex-1"><p className="truncate font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{naira(p.price_ngn)}/{p.unit}</p></div>
            <input aria-label="Stock" inputMode="numeric" defaultValue={p.quantity} key={p.quantity}
              onBlur={(e) => Number(e.target.value) !== p.quantity && setQty(p.id, Number(e.target.value) || 0)}
              className="h-10 w-20 rounded-lg bg-muted text-center font-bold" />
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-extrabold">Orders</h2>
      {orders.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>}
      <ul className="mt-3 space-y-2">
        {orders.map((o) => {
          const buyer = contact(o.buyer_id);
          const tel = buyer?.phone?.replace(/[^\d+]/g, "");
          const trip = tripFor(o.id);
          return (
            <li key={o.id} className="rounded-xl border bg-card p-3">
              <div className="flex justify-between text-sm font-bold"><span className="capitalize">{o.status}</span><span>{naira(o.total_ngn)}</span></div>
              <p className="mt-1 text-xs text-muted-foreground">{(o.items as { name: string; qty: number; unit: string }[]).map((i) => `${i.qty} ${i.unit} ${i.name}`).join(", ")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{buyer?.full_name ?? "Buyer"}{buyer?.phone ? ` · ${buyer.phone}` : ""}</span>
                {tel && <a href={`tel:${tel}`} className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground"><Phone className="size-3.5" />Call buyer</a>}
                {trip && <Link to="/trips/$id" params={{ id: trip.id }} className="flex h-9 items-center rounded-lg bg-muted px-3 text-xs font-bold">View delivery</Link>}
              </div>
              {o.status === "placed" && <button onClick={() => setStatus(o.id, "ready")} className="mt-2 h-9 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground">Mark ready for pickup</button>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
