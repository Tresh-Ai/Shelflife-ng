import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, PlugZap, Plus } from "lucide-react";
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
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"stock" | "orders">("stock");
  const incoming = orders.filter((o) => o.status === "placed" || o.status === "ready").length;
  return (
    <main className="px-4 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">My stock</h1>
        <button onClick={() => setAdding(true)} className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"><Plus className="size-4" />Add product</button>
      </header>
      <div className="mt-4 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-bold">
        {(["stock", "orders"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={"h-9 rounded-full capitalize " + (tab === t ? "bg-card shadow-sm" : "text-muted-foreground")}>
            {t === "stock" ? `Listings · ${mine.length}` : `Orders${incoming ? ` · ${incoming} new` : ""}`}
          </button>
        ))}
      </div>

      {tab === "stock" && (<>
        {mine.length === 0 && (
          <div className="mt-10 text-center">
            <p className="font-bold">No products yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add what you have in stock so buyers can order it.</p>
          </div>
        )}
        <ul className="mt-4 divide-y rounded-2xl border bg-card">
          {mine.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{naira(p.price_ngn)} per {p.unit} · {p.quantity === 0 ? <span className="font-semibold text-destructive">Out of stock</span> : `${p.quantity} left`}</p>
              </div>
              <div className="flex items-center rounded-full bg-muted">
                <button aria-label="Less" onClick={() => setQty(p.id, p.quantity - 1)} className="grid size-9 place-items-center text-lg font-bold">−</button>
                <span className="w-8 text-center text-sm font-bold">{p.quantity}</span>
                <button aria-label="More" onClick={() => setQty(p.id, p.quantity + 1)} className="grid size-9 place-items-center text-lg font-bold">+</button>
              </div>
            </li>
          ))}
        </ul>
      </>)}

      {tab === "orders" && (<>
        {orders.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">Orders from buyers show up here.</p>}
        <ul className="mt-4 space-y-2">
          {orders.map((o) => {
            const buyer = contact(o.buyer_id);
            const tel = buyer?.phone?.replace(/[^\d+]/g, "");
            const trip = tripFor(o.id);
            return (
              <li key={o.id} className="rounded-2xl border bg-card p-4">
                <div className="flex justify-between text-sm font-bold"><span className="capitalize">{trip && trip.status !== "searching" ? `Driver ${trip.status === "accepted" ? "coming to pick up" : trip.status.replace("_", " ")}` : o.status}</span><span>{naira(o.total_ngn)}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{(o.items as { name: string; qty: number; unit: string }[]).map((i) => `${i.qty} ${i.unit} ${i.name}`).join(", ")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{buyer?.full_name ?? "Buyer"}</span>
                  {tel && <a href={`tel:${tel}`} className="flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-bold"><Phone className="size-3.5" />Call</a>}
                  {trip && <Link to="/trips/$id" params={{ id: trip.id }} className="flex h-9 items-center rounded-full bg-muted px-3 text-xs font-bold">Track</Link>}
                  {o.status === "placed" && <button onClick={() => setStatus(o.id, "ready")} className="h-9 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground">Mark ready</button>}
                </div>
              </li>
            );
          })}
        </ul>
      </>)}

      <p className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground"><PlugZap className="size-3.5" />Warehouse inventory sync is coming soon.</p>

      {adding && (
        <div className="fixed inset-0 z-[1100] flex items-end bg-foreground/40" onClick={() => setAdding(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={async (e) => { await add(e); setAdding(false); }} className="mx-auto w-full max-w-lg space-y-2.5 rounded-t-3xl bg-card p-5 pb-8">
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Add product</h2><button type="button" onClick={() => setAdding(false)} className="text-sm font-bold text-muted-foreground">Cancel</button></div>
            <input autoFocus className={input} placeholder="Product name, e.g. Yam tubers" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}</select>
              <select className={input} value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
              <input className={input} inputMode="numeric" placeholder="Price ₦ per unit" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} required />
              <input className={input} inputMode="numeric" placeholder="Quantity" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value.replace(/\D/g, "") })} required />
            </div>
            <select className={input} value={f.market} onChange={(e) => setF({ ...f, market: e.target.value })}>{markets?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <button className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground">Add to stock</button>
          </form>
        </div>
      )}
    </main>
  );
}
