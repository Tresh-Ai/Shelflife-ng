import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { TripMap } from "@/components/app/TripMap";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, VEHICLES, naira } from "@/lib/dispatch";
import { useTrip, useUserId, type Trip } from "@/lib/trips";

export const Route = createFileRoute("/_authenticated/trips/$id")({
  head: () => ({ meta: [{ title: "Trip — ShelfLife" }, { name: "description", content: "Live delivery status." }] }),
  component: TripPage,
});

const STEPS = ["searching", "accepted", "picked_up", "delivered"] as const;

function TripPage() {
  const { id } = Route.useParams();
  const me = useUserId();
  const qc = useQueryClient();
  const { data: trip, isLoading } = useTrip(id);
  const isHauler = !!trip && trip.hauler_id === me;
  const live = !!trip && (trip.status === "accepted" || trip.status === "picked_up");

  const { data: hauler } = useQuery({
    queryKey: ["profile", trip?.hauler_id],
    enabled: !!trip?.hauler_id,
    queryFn: async () => (await supabase.from("profiles").select("full_name, vehicle").eq("id", trip!.hauler_id!).maybeSingle()).data,
  });

  // The hauler's phone shares its GPS position while the trip is active.
  useEffect(() => {
    if (!isHauler || !live || !navigator.geolocation) return;
    let last = 0;
    const w = navigator.geolocation.watchPosition(
      (p) => {
        if (Date.now() - last < 5000) return;
        last = Date.now();
        supabase.from("trips").update({ hauler_lat: p.coords.latitude, hauler_lng: p.coords.longitude }).eq("id", id).then();
      },
      () => toast.error("Turn on location so the buyer can follow you"),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(w);
  }, [isHauler, live, id]);

  async function setStatus(status: Trip["status"]) {
    const { error } = await supabase.from("trips").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["trips"] });
  }

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!trip) return <p className="p-6">This trip is no longer available. <Link to="/trips" className="underline">Back</Link></p>;

  const step = STEPS.indexOf(trip.status as (typeof STEPS)[number]);
  const vehicle = VEHICLES.find((v) => v.id === trip.vehicle);

  return (
    <div>
      <div className="relative">
        <TripMap className="h-[45dvh] w-full"
          pickup={{ lat: trip.pickup_lat, lng: trip.pickup_lng }}
          dropoff={{ lat: trip.dropoff_lat, lng: trip.dropoff_lng }}
          hauler={trip.hauler_lat != null && trip.hauler_lng != null ? { lat: trip.hauler_lat, lng: trip.hauler_lng } : null} />
        <Link to="/trips" aria-label="Back" className="absolute top-4 left-4 z-[500] grid size-10 place-items-center rounded-full bg-card shadow"><ArrowLeft className="size-5" /></Link>
      </div>
      <section className="relative z-[500] -mt-5 rounded-t-3xl bg-card px-5 pt-3 pb-6 shadow-[var(--shadow-sheet)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <div className="flex items-center gap-2">
          {trip.status === "searching" && <span className="size-2.5 animate-ping rounded-full bg-success" />}
          <h1 className="text-2xl font-extrabold tracking-tight">{STATUS_LABEL[trip.status]}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {trip.status === "searching" ? "Haulers nearby can see your request now." :
           trip.status === "delivered" ? "Your produce has arrived." :
           live && trip.hauler_lat == null ? "Waiting for the hauler's live location." : `${trip.distance_km} km trip`}
        </p>

        {trip.status !== "cancelled" && (
          <ol className="mt-5 grid grid-cols-4 gap-1.5">
            {STEPS.map((s, i) => <li key={s} className={"h-1.5 rounded-full " + (i <= step ? "bg-foreground" : "bg-muted")} />)}
          </ol>
        )}

        {hauler && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted p-3">
            <span className="grid size-11 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{(hauler.full_name ?? "H")[0]?.toUpperCase()}</span>
            <div>
              <p className="font-bold">{isHauler ? "You are driving" : hauler.full_name}</p>
              <p className="text-xs text-muted-foreground">{hauler.vehicle || vehicle?.name}</p>
            </div>
          </div>
        )}

        <dl className="mt-5 space-y-3 text-[15px]">
          <Row k="Pickup" v={trip.pickup_name} />
          <Row k="Drop-off" v={trip.dropoff_name} />
          <Row k="Load" v={`${trip.crates} crates · ${trip.produce}`} />
          <Row k="Vehicle" v={vehicle?.name ?? trip.vehicle} />
          <Row k="Price" v={naira(trip.price_ngn)} bold />
        </dl>

        <div className="mt-6 space-y-2">
          {isHauler && trip.status === "accepted" && <Action onClick={() => setStatus("picked_up")}>Confirm pickup</Action>}
          {isHauler && trip.status === "picked_up" && <Action onClick={() => setStatus("delivered")}><Check className="size-5" /> Mark delivered</Action>}
          {!isHauler && trip.status === "searching" && (
            <button onClick={() => setStatus("cancelled")} className="h-12 w-full rounded-xl bg-muted font-bold">Cancel request</button>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className={"text-right " + (bold ? "font-extrabold" : "font-semibold")}>{v}</dd></div>;
}
function Action({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground">{children}</button>;
}
