import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, naira } from "@/lib/dispatch";
import { useMarkets, useProfile } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — ShelfLife" }, { name: "description", content: "ShelfLife admin console for people, markets, stock and orders." }] }),
  component: Admin,
});

const TABS = ["People", "Markets", "Stock", "Orders", "Trips"] as const;
type Tab = (typeof TABS)[number];

function Admin() {
  const { data: me } = useProfile();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("People");
  const on = !!me?.isAdmin;

  const { data: people = [] } = useQuery({
    queryKey: ["admin", "people"], enabled: on,
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: roles = [] } = useQuery({
    queryKey: ["admin", "roles"], enabled: on,
    queryFn: async () => (await supabase.from("user_roles").select("user_id, role")).data ?? [],
  });
  const { data: listings = [] } = useQuery({
    queryKey: ["admin", "listings"], enabled: on,
    queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"], enabled: on,
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: trips = [] } = useQuery({
    queryKey: ["admin", "trips"], enabled: on,
    queryFn: async () => (await supabase.from("trips").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: markets = [] } = useMarkets();

  if (!me) return <main className="px-5 pt-8 text-muted-foreground">Loading…</main>;
  if (!me.isAdmin) {
    return (
      <main className="px-5 pt-12">
        <h1 className="text-2xl font-extrabold tracking-tight">Admins only</h1>
        <p className="mt-2 text-muted-foreground">This page is for ShelfLife staff. Ask an admin to add your account.</p>
        <Link to="/dispatch" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-bold text-primary-foreground">Back to request</Link>
      </main>
    );
  }

  const isAdmin = (id: string) => roles.some((r) => r.user_id === id && r.role === "admin");
  const personName = (id: string) => people.find((p) => p.id === id)?.full_name ?? people.find((p) => p.id === id)?.email ?? "Someone";
  const marketName = (id: string) => markets.find((m) => m.id === id)?.name ?? id;
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });

  async function toggleAdmin(id: string, now: boolean) {
    const { error } = now
      ? await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin")
      : await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
    if (error) toast.error(error.message); else { toast.success(now ? "Admin removed" : "Made admin"); refresh(); }
  }

  async function addMarket(e: React.FormEvent, f: { name: string; area: string; lat: string; lng: string }) {
    e.preventDefault();
    const id = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("markets").insert({ id, name: f.name, area: f.area, lat: Number(f.lat), lng: Number(f.lng) });
    if (error) { toast.error(error.message); return; }
    toast.success("Market added");
    qc.invalidateQueries({ queryKey: ["markets"] });
  }

  async function dropListing(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Listing removed"); refresh(); }
  }

  async function setOrderStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }

  async function setTripStatus(id: string, status: string) {
    const { error } = await supabase.from("trips").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }

  const input = "h-11 w-full rounded-xl bg-muted px-3 text-[15px] outline-none focus:ring-2 focus:ring-ring";
  const card = "rounded-xl border bg-card p-3";

  return (
    <main className="px-4 pt-6 pb-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5" />
        <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[["People", people.length], ["Markets", markets.length], ["Listings", listings.length], ["Orders", orders.length]].map(([k, n]) => (
          <div key={k as string} className={card}>
            <p className="text-xl font-extrabold tabular-nums">{n as number}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k as string}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
            className={"h-9 shrink-0 rounded-full px-4 text-sm font-semibold " + (tab === t ? "bg-primary text-primary-foreground" : "bg-muted")}>{t}</button>
        ))}
      </div>

      {tab === "People" && (
        <ul className="mt-4 space-y-2">
          {people.map((p) => (
            <li key={p.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.full_name ?? "No name yet"}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.email ?? "No email"}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.mode === "driver" ? "Driver" : p.mode === "seller" ? `Seller${p.seller_type ? " · " + p.seller_type : ""}` : "Buyer"}
                    {p.phone ? ` · ${p.phone}` : ""}{p.market_id ? ` · ${marketName(p.market_id)}` : ""}
                  </p>
                </div>
                <button onClick={() => toggleAdmin(p.id, isAdmin(p.id))}
                  className={"h-9 shrink-0 rounded-lg px-3 text-xs font-bold " + (isAdmin(p.id) ? "bg-muted" : "bg-primary text-primary-foreground")}>
                  {isAdmin(p.id) ? "Remove admin" : "Make admin"}
                </button>
              </div>
            </li>
          ))}
          {people.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No accounts yet.</li>}
        </ul>
      )}

      {tab === "Markets" && (
        <>
          <MarketForm onSubmit={addMarket} input={input} />
          <ul className="mt-4 space-y-2">
            {markets.map((m) => (
              <li key={m.id} className={card + " flex items-center gap-3"}>
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{m.name}</p><p className="text-xs text-muted-foreground">{m.area} · {m.lat.toFixed(4)}, {m.lng.toFixed(4)}</p></div>
                <button aria-label={`Remove ${m.name}`} onClick={async () => {
                  const { error } = await supabase.from("markets").delete().eq("id", m.id);
                  if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["markets"] });
                }} className="grid size-9 place-items-center rounded-lg bg-muted"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "Stock" && (
        <ul className="mt-4 space-y-2">
          {listings.map((p) => (
            <li key={p.id} className={card + " flex items-center gap-3"}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{naira(p.price_ngn)}/{p.unit} · {p.quantity} left · {marketName(p.market_id)} · {personName(p.seller_id)}</p>
              </div>
              <button aria-label={`Remove ${p.name}`} onClick={() => dropListing(p.id)} className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"><Trash2 className="size-4" /></button>
            </li>
          ))}
          {listings.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No listings yet.</li>}
        </ul>
      )}

      {tab === "Orders" && (
        <ul className="mt-4 space-y-2">
          {orders.map((o) => (
            <li key={o.id} className={card}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{personName(o.buyer_id)} → {personName(o.seller_id)}</p>
                  <p className="truncate text-xs text-muted-foreground">{naira(o.total_ngn)} · {marketName(o.market_id)} · {(o.items as { name: string; qty: number }[]).map((i) => `${i.qty} ${i.name}`).join(", ")}</p>
                </div>
                <select aria-label="Order status" className="h-9 shrink-0 rounded-lg bg-muted px-2 text-sm font-semibold" value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)}>
                  {["placed", "ready", "picked_up", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </li>
          ))}
          {orders.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No orders yet.</li>}
        </ul>
      )}

      {tab === "Trips" && (
        <ul className="mt-4 space-y-2">
          {trips.map((t) => (
            <li key={t.id} className={card}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{t.pickup_name} → {t.dropoff_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{personName(t.buyer_id)} · {naira(t.price_ngn)} · {t.distance_km} km · {STATUS_LABEL[t.status]}</p>
                </div>
                <select aria-label="Trip status" className="h-9 shrink-0 rounded-lg bg-muted px-2 text-sm font-semibold" value={t.status} onChange={(e) => setTripStatus(t.id, e.target.value)}>
                  {["searching", "accepted", "picked_up", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </li>
          ))}
          {trips.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No trips yet.</li>}
        </ul>
      )}
    </main>
  );
}

function MarketForm({ onSubmit, input }: { onSubmit: (e: React.FormEvent, f: { name: string; area: string; lat: string; lng: string }) => void; input: string }) {
  const [f, setF] = useState({ name: "", area: "", lat: "", lng: "" });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e, f); }} className="mt-4 space-y-2 rounded-2xl border bg-card p-4">
      <h2 className="font-extrabold">Add a market or hub</h2>
      <input className={input} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
      <input className={input} placeholder="Area, e.g. Alimosho" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} required />
      <div className="grid grid-cols-2 gap-2">
        <input className={input} inputMode="decimal" placeholder="Latitude" value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} required />
        <input className={input} inputMode="decimal" placeholder="Longitude" value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} required />
      </div>
      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground"><Plus className="size-4" />Add market</button>
    </form>
  );
}
