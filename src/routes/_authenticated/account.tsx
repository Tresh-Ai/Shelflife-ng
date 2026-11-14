import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronRight, ListOrdered, Package, Truck, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROLES, SELLER_TYPES } from "@/lib/catalog";
import { useMarkets, useProfile } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — ShelfLife" }, { name: "description", content: "Your ShelfLife account." }] }),
  component: Account,
});

function Account() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: p } = useProfile();
  const { data: markets } = useMarkets();
  const { data: email } = useQuery({ queryKey: ["email"], queryFn: async () => (await supabase.auth.getUser()).data.user?.email ?? "" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [market, setMarket] = useState("");
  useEffect(() => { if (p) { setName(p.full_name ?? ""); setPhone(p.phone ?? ""); setVehicle(p.vehicle ?? ""); setMarket(p.market_id ?? ""); } }, [p]);

  if (!p) return <main className="px-5 pt-8 text-muted-foreground">Loading…</main>;
  const role = ROLES.find((r) => r.id === p.mode);
  const sellerType = SELLER_TYPES.find((t) => t.id === p.seller_type);

  async function save() {
    const { error } = await supabase.from("profiles").update({
      full_name: name, phone,
      vehicle: p!.mode === "driver" ? vehicle : p!.vehicle,
      market_id: p!.mode === "seller" ? market || null : p!.market_id,
    }).eq("id", p!.id);
    if (error) toast.error(error.message); else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); }
  }
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const input = "h-12 w-full rounded-xl bg-muted px-4 text-[15px] outline-none focus:ring-2 focus:ring-ring";
  const links = p.mode === "driver"
    ? [{ to: "/jobs", label: "Open delivery jobs", icon: Truck }, { to: "/trips", label: "My trips and earnings", icon: ListOrdered }]
    : p.mode === "seller"
    ? [{ to: "/sell", label: "My stock and orders", icon: Package }, { to: "/trips", label: "Deliveries", icon: ListOrdered }]
    : [{ to: "/shop", label: "Buy produce", icon: ShoppingBasket }, { to: "/trips", label: "My deliveries", icon: ListOrdered }];

  return (
    <main className="px-5 pt-8 pb-8">
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-primary text-xl font-extrabold text-primary-foreground">{(name || email || "?").slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{name || "Your account"}</h1>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {p.mode === "driver" ? "Driver" : p.mode === "seller" ? `Seller${sellerType ? " · " + sellerType.title : ""}` : "Buyer"}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{role?.note}</p>

      <ul className="mt-6 divide-y rounded-2xl border bg-card">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}><Link to={to} className="flex items-center gap-3 p-4 font-semibold"><Icon className="size-5" /><span className="flex-1">{label}</span><ChevronRight className="size-4 text-muted-foreground" /></Link></li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-extrabold">Your details</h2>
      <label className="mt-3 block text-sm font-semibold">Name<input className={input + " mt-1.5"} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="mt-4 block text-sm font-semibold">Phone<input className={input + " mt-1.5"} type="tel" placeholder="080..." value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      {p.mode === "driver" && (
        <label className="mt-4 block text-sm font-semibold">Your vehicle and plate
          <input className={input + " mt-1.5"} placeholder="e.g. White Toyota Hiace, LND 123 AB" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
        </label>
      )}
      {p.mode === "seller" && (
        <label className="mt-4 block text-sm font-semibold">Your market or store location
          <select className={input + " mt-1.5"} value={market} onChange={(e) => setMarket(e.target.value)}>
            <option value="">Choose a market</option>
            {markets?.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.area}</option>)}
          </select>
        </label>
      )}
      <button onClick={save} className="mt-5 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground">Save</button>
      <button onClick={signOut} className="mt-3 h-12 w-full rounded-xl bg-muted font-bold">Sign out</button>
    </main>
  );
}
