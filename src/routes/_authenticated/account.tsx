import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/trips";
import { ROLES, type Role } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — ShelfLife" }, { name: "description", content: "Your ShelfLife account." }] }),
  component: Account,
});

function Account() {
  const me = useUserId();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["profile", me],
    enabled: !!me,
    queryFn: async () => {
      const [{ data: p }, { data: u }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", me!).maybeSingle(),
        supabase.auth.getUser(),
      ]);
      return { profile: p, email: u.user?.email };
    },
  });
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  useEffect(() => { setName(data?.profile?.full_name ?? ""); setVehicle(data?.profile?.vehicle ?? ""); }, [data]);

  async function save() {
    const { error } = await supabase.from("profiles").upsert({ id: me!, full_name: name, vehicle });
    if (error) toast.error(error.message); else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); }
  }
  async function switchRole(mode: Role) {
    const { error } = await supabase.from("profiles").update({ mode }).eq("id", me!);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["profile"] });
  }
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const input = "h-12 w-full rounded-xl bg-muted px-4 text-[15px] outline-none focus:ring-2 focus:ring-ring";
  return (
    <main className="px-5 pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Account</h1>
      <p className="mt-1 text-muted-foreground">{data?.email}</p>
      <p className="mt-6 text-sm font-semibold">I use ShelfLife to</p>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button key={r.id} onClick={() => switchRole(r.id)} aria-pressed={data?.profile?.mode === r.id}
            className={"h-11 rounded-xl text-sm font-bold " + (data?.profile?.mode === r.id ? "bg-primary text-primary-foreground" : "bg-muted")}>
            {r.id === "buyer" ? "Buy" : r.id === "driver" ? "Drive" : "Sell"}
          </button>
        ))}
      </div>
      <label className="mt-6 block text-sm font-semibold">Name<input className={input + " mt-1.5"} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="mt-4 block text-sm font-semibold">Your vehicle (if you drive)
        <input className={input + " mt-1.5"} placeholder="e.g. White Toyota Hiace, LND 123 AB" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
      </label>
      <button onClick={save} className="mt-5 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground">Save</button>
      <button onClick={signOut} className="mt-3 h-12 w-full rounded-xl bg-muted font-bold">Sign out</button>
    </main>
  );
}
