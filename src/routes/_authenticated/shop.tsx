import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingBasket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, cartTotal } from "@/lib/catalog";
import { naira } from "@/lib/dispatch";
import { useCart, useImage, useMarkets } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({ meta: [{ title: "Shop produce in bulk — ShelfLife" }, { name: "description", content: "Buy farm produce in bulk from Lagos markets." }] }),
  component: Shop,
});

type Product = { id: string; name: string; category: string; unit: string; price_ngn: number; quantity: number; market_id: string; seller_id: string; image_url: string | null };

function Shop() {
  const [cat, setCat] = useState<string>("All");
  const [market, setMarket] = useState<string>("all");
  const [q, setQ] = useState("");
  const { data: markets } = useMarkets();
  const cart = useCart();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").gt("quantity", 0).order("name");
      if (error) throw error;
      return data as Product[];
    },
  });
  const list = useMemo(() => products.filter((p) =>
    (cat === "All" || p.category === cat) && (market === "all" || p.market_id === market) &&
    p.name.toLowerCase().includes(q.toLowerCase())), [products, cat, market, q]);
  const count = cart.lines.reduce((s, l) => s + l.qty, 0);
  const mName = (id: string) => markets?.find((m) => m.id === id)?.name ?? id;

  return (
    <main className="px-4 pt-6">
      <Link to="/dispatch" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground"><ArrowLeft className="size-4" />Back to request</Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Pick produce</h1>
      <p className="text-sm text-muted-foreground">Add what you need from one market. We deliver it in one trip.</p>
      <div className="mt-4 flex gap-2">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-muted px-3">
          <Search className="size-4 text-muted-foreground" />
          <input className="w-full bg-transparent text-[15px] outline-none" placeholder="Search yam, garri, pepper…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select aria-label="Market" className="h-11 max-w-[42%] rounded-xl bg-muted px-2 text-sm font-semibold" value={market} onChange={(e) => setMarket(e.target.value)}>
          <option value="all">All markets</option>
          {markets?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {["All", ...CATEGORIES.map((c) => c.id)].map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={"h-9 shrink-0 rounded-full px-4 text-sm font-semibold " + (cat === c ? "bg-primary text-primary-foreground" : "bg-muted")}>{c}</button>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 pb-24">
        {list.map((p) => <Item key={p.id} p={p} market={mName(p.market_id)} />)}
        {list.length === 0 && <li className="col-span-2 py-16 text-center text-muted-foreground">Nothing matches yet.</li>}
      </ul>
      {count > 0 && (
        <Link to="/dispatch" className="fixed inset-x-4 bottom-20 z-[1001] mx-auto flex h-14 max-w-md items-center justify-between rounded-2xl bg-primary px-5 font-bold text-primary-foreground shadow-lg">
          <span className="flex items-center gap-2"><ShoppingBasket className="size-5" />{count} in basket · Continue</span>
          <span>{naira(cartTotal(cart.lines))}</span>
        </Link>
      )}
    </main>
  );
}

function Item({ p, market }: { p: Product; market: string }) {
  const cart = useCart();
  const img = useImage(p.image_url, p.category);
  const qty = cart.lines.find((l) => l.product_id === p.id)?.qty ?? 0;
  const { quantity: _s, ...line } = p;
  void _s;
  const set = (n: number) => { if (n > 0 && cart.lines.some((l) => l.market_id !== p.market_id)) { toast.error("One market per delivery. Finish this basket first."); return; } cart.set({ ...line, product_id: p.id }, n, p.quantity) };
  return (
    <li className="overflow-hidden rounded-2xl border bg-card">
      <img src={img} alt={p.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-bold leading-tight">{p.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{market} · {p.quantity} left</p>
        <p className="mt-1.5 font-extrabold">{naira(p.price_ngn)}<span className="text-xs font-medium text-muted-foreground"> /{p.unit}</span></p>
        {qty === 0 ? (
          <button onClick={() => set(1)} className="mt-2 h-9 w-full rounded-lg bg-primary text-sm font-bold text-primary-foreground">Add</button>
        ) : (
          <div className="mt-2">
            <div className="flex h-9 items-center justify-between rounded-lg bg-muted">
              <button aria-label="Less" onClick={() => set(qty - 1)} className="grid size-9 place-items-center"><Minus className="size-4" /></button>
              <input aria-label="Quantity" inputMode="numeric" className="w-12 bg-transparent text-center font-bold outline-none" value={qty}
                onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || 0)} />
              <button aria-label="More" onClick={() => set(qty + 1)} className="grid size-9 place-items-center"><Plus className="size-4" /></button>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {[5, 10].map((n) => <button key={n} onClick={() => set(qty + n)} className="h-7 flex-1 rounded-md border text-xs font-bold">+{n}</button>)}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
