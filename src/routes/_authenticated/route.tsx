import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MapPin, ListOrdered, Truck, User, Store, Package } from "lucide-react";
import { useCatalogRealtime, useProfile } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const T = {
  shop: { to: "/shop", label: "Shop", icon: Store },
  sell: { to: "/sell", label: "My stock", icon: Package },
  request: { to: "/dispatch", label: "Request", icon: MapPin },
  trips: { to: "/trips", label: "Trips", icon: ListOrdered },
  drive: { to: "/jobs", label: "Drive", icon: Truck },
  account: { to: "/account", label: "Account", icon: User },
} as const;
const BY_ROLE = {
  buyer: [T.request, T.trips, T.account],
  driver: [T.drive, T.trips, T.account],
  seller: [T.sell, T.request, T.trips, T.account],
};

function Shell() {
  const { data: p } = useProfile();
  useCatalogRealtime();
  useSellerAlerts(p?.mode === "seller" ? p.id : undefined);
  useDriverTracking(p?.mode === "driver" ? p.id : undefined);
  const tabs = BY_ROLE[p?.mode ?? "buyer"];
  const path = useLocation({ select: (l) => l.pathname });
  const navigate = useNavigate();
  const onboarding = path === "/onboarding";
  useEffect(() => { if (p && p.onboarded === false && !onboarding) navigate({ to: "/onboarding", replace: true }); }, [p, onboarding, navigate]);
  if (onboarding || (p && p.onboarded === false)) return <div className="mx-auto min-h-dvh max-w-lg bg-background"><Outlet /></div>;
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <div className="flex-1 pb-20"><Outlet /></div>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-[1000] border-t border-border/60 bg-card/85 backdrop-blur-xl">
        <ul className="mx-auto grid max-w-lg px-2" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="group flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted-foreground transition-colors" activeProps={{ className: "!text-foreground is-active" }}>
                <span className="grid h-7 w-12 place-items-center rounded-full transition-colors group-[.is-active]:bg-primary/12 group-[.is-active]:text-primary"><Icon className="size-5" /></span>{label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Pings a seller when a buyer orders from them or a driver is coming to collect. */
function useSellerAlerts(me?: string) {
  useEffect(() => {
    if (!me) return;
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    const say = (msg: string) => {
      toast(msg);
      if ("Notification" in window && Notification.permission === "granted") new Notification("ShelfLife", { body: msg, icon: "/favicon.svg" });
    };
    const ch = supabase.channel(`seller-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `seller_id=eq.${me}` }, () => say("New order. Get it ready for pickup."))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "trips" }, (e) => {
        const t = e.new as { status: string; hauler_id: string | null };
        if (t.status === "accepted") say("A driver is on the way to pick up your order.");
        if (t.status === "delivered") say("Your order was delivered and paid.");
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me]);
}

/** While the driver has the app open, share GPS on every active trip so buyers and sellers see the bike move. */
function useDriverTracking(me?: string) {
  useEffect(() => {
    if (!me || !navigator.geolocation) return;
    let last = 0;
    const w = navigator.geolocation.watchPosition((pos) => {
      if (Date.now() - last < 8000) return;
      last = Date.now();
      supabase.from("trips").update({ hauler_lat: pos.coords.latitude, hauler_lng: pos.coords.longitude })
        .eq("hauler_id", me).in("status", ["accepted", "picked_up", "arrived"]).then();
    }, () => {}, { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(w);
  }, [me]);
}
