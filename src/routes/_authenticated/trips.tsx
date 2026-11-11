import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, naira } from "@/lib/dispatch";
import { useTripsRealtime, useUserId } from "@/lib/trips";

export const Route = createFileRoute("/_authenticated/trips")({
  head: () => ({ meta: [{ title: "Your trips — ShelfLife" }, { name: "description", content: "Your produce deliveries." }] }),
  component: TripsLayout,
});

function TripsLayout() {
  const child = useMatch({ from: "/_authenticated/trips/$id", shouldThrow: false });
  return child ? <Outlet /> : <TripList />;
}

function TripList() {
  useTripsRealtime();
  const me = useUserId();
  const { data, isLoading } = useQuery({
    queryKey: ["trips", "mine", me],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*")
        .or(`buyer_id.eq.${me},hauler_id.eq.${me}`).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <main className="px-5 pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Trips</h1>
      {isLoading ? <p className="mt-6 text-muted-foreground">Loading…</p> : !data?.length ? (
        <div className="mt-10 rounded-2xl bg-muted p-6">
          <p className="font-bold">No trips yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Request a hauler and it will show here.</p>
          <Link to="/dispatch" className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-bold text-primary-foreground">Request a hauler</Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y">
          {data.map((t) => (
            <li key={t.id}>
              <Link to="/trips/$id" params={{ id: t.id }} className="flex items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{t.pickup_name} → {t.dropoff_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.hauler_id === me ? "Driving · " : ""}{STATUS_LABEL[t.status]} · {t.crates} crates {t.produce.toLowerCase()}
                  </p>
                </div>
                <span className="font-extrabold tabular-nums">{naira(t.price_ngn)}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
