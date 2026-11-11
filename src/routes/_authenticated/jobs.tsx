import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VEHICLES, naira } from "@/lib/dispatch";
import { useTripsRealtime, useUserId } from "@/lib/trips";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({ meta: [{ title: "Drive — ShelfLife" }, { name: "description", content: "Open produce delivery requests near you." }] }),
  component: Jobs,
});

function Jobs() {
  useTripsRealtime();
  const me = useUserId();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["trips", "open", me],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*")
        .eq("status", "searching").is("hauler_id", null).neq("buyer_id", me!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function accept(id: string) {
    const { data: rows, error } = await supabase.from("trips")
      .update({ hauler_id: me ?? null, status: "accepted" })
      .eq("id", id).eq("status", "searching").is("hauler_id", null).select("id");
    if (error) { toast.error(error.message); return; }
    if (!rows?.length) { toast.error("Another hauler took this job"); return; }
    navigate({ to: "/trips/$id", params: { id } });
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Drive</h1>
      <p className="mt-1 text-muted-foreground">Open requests. Accept one and you're on.</p>
      {isLoading ? <p className="mt-6 text-muted-foreground">Loading…</p> : !data?.length ? (
        <div className="mt-8 rounded-2xl bg-muted p-6">
          <p className="font-bold">No open requests right now</p>
          <p className="mt-1 text-sm text-muted-foreground">New requests appear here instantly.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.map((t) => (
            <li key={t.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{t.pickup_name}</p>
                  <p className="text-sm text-muted-foreground">to {t.dropoff_name}</p>
                </div>
                <span className="text-xl font-extrabold tabular-nums">{naira(t.price_ngn)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.crates} crates {t.produce.toLowerCase()} · {VEHICLES.find((v) => v.id === t.vehicle)?.name} · {t.distance_km} km
              </p>
              <button onClick={() => accept(t.id)} className="mt-4 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground">Accept job</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
