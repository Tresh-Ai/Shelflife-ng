import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bike, Truck, Snowflake, ShoppingBasket, ChevronRight, ArrowLeft, Wallet, Search } from "lucide-react";
import { toast } from "sonner";
import { TripMap } from "@/components/app/TripMap";
import { PlacePicker } from "@/components/app/PlacePicker";
import { HUBS, VEHICLES, distanceKm, quote, naira, type Place, type VehicleId } from "@/lib/dispatch";
import { cartTotal } from "@/lib/catalog";
import { useCart, useMarkets, useProfile } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dispatch")({
  head: () => ({ meta: [{ title: "Request a delivery — ShelfLife" }, { name: "description", content: "Book a rider or truck to move produce." }] }),
  component: Dispatch,
});

const ICON = { bike: Bike, van: Truck, cold: Snowflake } as const;

function Dispatch() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cart = useCart();
  const { data: markets } = useMarkets();
  const { data: me } = useProfile();
  const [pickupSel, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [vehicle, setVehicle] = useState<VehicleId>("bike");
  const [step, setStep] = useState<"plan" | "pay">("plan");
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState<"pickup" | "dropoff" | null>(null);

  const hasBasket = cart.lines.length > 0;
  const market = hasBasket ? markets?.find((m) => m.id === cart.lines[0]!.market_id) : undefined;
  const pickup: Place | null = market ? { id: market.id, name: market.name, area: market.area, lat: market.lat, lng: market.lng } : pickupSel;
  const goods = cartTotal(cart.lines);
  const count = cart.lines.reduce((s, l) => s + l.qty, 0);

  const marketPlaces: Place[] = (markets ?? []).map((m) => ({ id: m.id, name: m.name, area: m.area, lat: m.lat, lng: m.lng }));
  const hubPlaces: Place[] = HUBS.filter((h) => !marketPlaces.some((m) => m.id === h.id));

  const km = pickup && dropoff ? distanceKm(pickup, dropoff) : 0;
  const quotes = useMemo(() => VEHICLES.map((v) => ({ v, ...quote(v, km, 1) })), [km]);
  const chosen = quotes.find((q) => q.v.id === vehicle)!;
  const ready = !!pickup && !!dropoff && pickup.id !== dropoff.id;
  const isSeller = me?.mode === "seller";

  async function confirm() {
    if (!pickup || !dropoff) return;
    setBusy(true);
    let orderIds: string[] = [];
    if (hasBasket) {
      const { data, error } = await supabase.rpc("place_order", { _items: cart.lines.map((l) => ({ product_id: l.product_id, qty: l.qty })) });
      if (error) { setBusy(false); toast.error(error.message); return; }
      orderIds = data ?? [];
    }
    const { data: u } = await supabase.auth.getUser();
    const summary = hasBasket ? cart.lines.map((l) => `${l.qty} ${l.unit} ${l.name}`).join(", ") : isSeller ? "Seller stock" : "Own goods";
    const { data, error } = await supabase.from("trips").insert({
      buyer_id: u.user!.id,
      pickup_name: pickup.name, pickup_lat: pickup.lat, pickup_lng: pickup.lng,
      dropoff_name: dropoff.name, dropoff_lat: dropoff.lat, dropoff_lng: dropoff.lng,
      produce: summary, crates: Math.max(1, count), vehicle, distance_km: km, price_ngn: chosen.price,
      order_ids: orderIds, goods_ngn: goods,
    }).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    cart.clear();
    qc.invalidateQueries({ queryKey: ["products"] });
    navigate({ to: "/trips/$id", params: { id: data.id } });
  }


  if (step === "pay" && pickup && dropoff) {
    return (
      <main className="px-5 pt-6 pb-8">
        <button onClick={() => setStep("plan")} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground"><ArrowLeft className="size-4" />Back</button>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Confirm and pay</h1>
        <div className="mt-5 rounded-2xl border bg-card p-4 text-[15px]">
          <p className="font-bold">{pickup.name} → {dropoff.name}</p>
          <p className="text-sm text-muted-foreground">{chosen.v.name} · {km} km · about {chosen.minutes} min</p>
          {hasBasket && <p className="mt-3 text-sm">{cart.lines.map((l) => `${l.qty} ${l.unit} ${l.name}`).join(", ")}</p>}
          <dl className="mt-4 space-y-1.5 border-t pt-3">
            {hasBasket && <div className="flex justify-between"><dt>Produce</dt><dd className="font-semibold">{naira(goods)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd className="font-semibold">{naira(chosen.price)}</dd></div>
            <div className="flex justify-between pt-1 text-lg font-extrabold"><dt>Total</dt><dd>{naira(goods + chosen.price)}</dd></div>
          </dl>
        </div>
        <p className="mt-6 text-sm font-bold">Payment</p>
        <div className="mt-2 flex items-center gap-3 rounded-xl border-2 border-foreground p-3">
          <Wallet className="size-5" /><span className="flex-1"><span className="block font-bold">Pay on delivery</span><span className="text-xs text-muted-foreground">Cash or transfer to the rider when it arrives</span></span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Card and in-app payment are coming soon.</p>
        <button onClick={confirm} disabled={busy} className="mt-6 h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-50">
          {busy ? "Finding a rider…" : `Request ${chosen.v.name} · ${naira(goods + chosen.price)}`}
        </button>
      </main>
    );
  }

  return (
    <div>
      <TripMap pickup={pickup} dropoff={dropoff} className="h-[36dvh] w-full" />
      <section className="relative z-[500] -mt-5 rounded-t-3xl bg-card px-5 pt-3 pb-6 shadow-[var(--shadow-sheet)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h1 className="text-2xl font-extrabold tracking-tight">{isSeller ? "Send stock to a buyer" : "Request a delivery"}</h1>

        {!isSeller && (
          <Link to="/shop" className="mt-4 flex items-center gap-3 rounded-xl bg-primary/10 p-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><ShoppingBasket className="size-5" /></span>
            <span className="flex-1">
              {hasBasket ? (<><span className="block font-bold">{count} items · {naira(goods)}</span><span className="text-xs text-muted-foreground">From {market?.name ?? "market"} · tap to edit</span></>)
                : (<><span className="block font-bold">Buy produce from a market</span><span className="text-xs text-muted-foreground">Pick items, we pick them up for you</span></>)}
            </span>
            <ChevronRight className="size-5" />
          </Link>
        )}

        <div className="relative mt-4 rounded-2xl bg-muted p-1.5">
          <span aria-hidden className="absolute top-[30px] bottom-[30px] left-[23px] w-px bg-foreground/25" />
          {hasBasket ? (
            <div className="flex h-12 items-center gap-3 px-3 text-[15px] font-semibold">
              <span className="size-2.5 shrink-0 rounded-full bg-foreground" /><span className="truncate">{pickup?.name ?? "Market"}</span>
              <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground">Market pickup</span>
            </div>
          ) : (
            <button onClick={() => setPicking("pickup")} className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold transition hover:bg-card">
              <span className="size-2.5 shrink-0 rounded-full bg-foreground" />
              <span className={"truncate " + (pickupSel ? "" : "text-muted-foreground")}>{pickupSel?.name ?? (isSeller ? "Your store or farm" : "Pick up from")}</span>
              <Search className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </button>
          )}
          <div className="ml-10 h-px bg-border" />
          <button onClick={() => setPicking("dropoff")} className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold transition hover:bg-card">
            <span className="size-2.5 shrink-0 rounded-[3px] bg-success" />
            <span className={"truncate " + (dropoff ? "" : "text-muted-foreground")}>{dropoff?.name ?? (isSeller ? "Deliver to buyer" : "Where to?")}</span>
            <Search className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
        {ready && <p className="mt-2 px-1 text-xs font-medium text-muted-foreground">{km} km trip</p>}

        <ul className={"mt-4 space-y-1.5 transition-opacity " + (ready ? "" : "opacity-60")}>
          {quotes.map(({ v, price, minutes }) => {
            const Icon = ICON[v.id];
            const on = vehicle === v.id;
            return (
              <li key={v.id}>
                <button onClick={() => setVehicle(v.id)} aria-pressed={on}
                  className={"flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition " + (on ? "border-foreground bg-card" : "border-transparent hover:bg-muted")}>
                  <span className="grid size-11 place-items-center rounded-xl bg-muted"><Icon className="size-5" /></span>
                  <span className="flex-1"><span className="block font-bold">{v.name}</span><span className="block text-xs text-muted-foreground">{v.note}</span></span>
                  <span className="text-right">
                    <span className="block font-extrabold tabular-nums">{ready ? naira(price) : "—"}</span>
                    <span className="block text-xs text-muted-foreground">{ready ? `${minutes} min` : ""}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button onClick={() => setStep("pay")} disabled={!ready}
          className="mt-5 h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-sm transition active:scale-[0.99] disabled:opacity-40">
          {ready ? `Continue · ${naira(goods + chosen.price)}` : hasBasket ? "Choose where to deliver" : "Choose pickup and drop-off"}
        </button>
      </section>

      {picking && (
        <PlacePicker
          title={picking === "pickup" ? (isSeller ? "Where is the stock?" : "Pick up from") : isSeller ? "Deliver to buyer" : "Deliver to"}
          hubs={hubPlaces}
          markets={marketPlaces}
          onClose={() => setPicking(null)}
          onPick={(p) => {
            if (picking === "pickup") setPickup(p); else setDropoff(p);
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}
