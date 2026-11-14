import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROLES, SELLER_TYPES, type Role, type SellerType } from "@/lib/catalog";
import { homeFor, useProfile } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Choose your role — ShelfLife" }, { name: "description", content: "Tell us how you use ShelfLife." }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p } = useProfile();
  const [role, setRole] = useState<Role | null>(null);
  const [sellerType, setSellerType] = useState<SellerType | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const r = localStorage.getItem("sl-role") as Role | null;
    if (r && ROLES.some((x) => x.id === r)) setRole(r);
    const t = localStorage.getItem("sl-seller-type") as SellerType | null;
    if (t) setSellerType(t);
  }, []);

  async function save() {
    if (!role || !p) return;
    if (role === "seller" && !sellerType) { toast.error("Choose what kind of seller you are"); return; }
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ mode: role, seller_type: role === "seller" ? sellerType : null, onboarded: true }).eq("id", p.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    localStorage.removeItem("sl-role"); localStorage.removeItem("sl-seller-type");
    await qc.invalidateQueries({ queryKey: ["profile"] });
    navigate({ to: homeFor(role), replace: true });
  }

  return (
    <main className="px-5 pt-12 pb-10">
      <h1 className="text-3xl font-extrabold tracking-tight">How will you use ShelfLife?</h1>
      <p className="mt-2 text-muted-foreground">Pick one to finish setting up your account.</p>
      <div className="mt-6 grid gap-2">
        {ROLES.map((r) => (
          <button key={r.id} onClick={() => setRole(r.id)} aria-pressed={role === r.id}
            className={"rounded-xl border-2 p-4 text-left " + (role === r.id ? "border-primary bg-primary/5" : "border-border")}>
            <span className="block font-bold">{r.title}</span><span className="text-sm text-muted-foreground">{r.note}</span>
          </button>
        ))}
      </div>
      {role === "seller" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {SELLER_TYPES.map((t) => (
            <button key={t.id} onClick={() => setSellerType(t.id)} aria-pressed={sellerType === t.id}
              className={"rounded-xl border-2 p-2.5 text-left text-sm " + (sellerType === t.id ? "border-primary bg-primary/5" : "border-border")}>
              <span className="block font-bold">{t.title}</span><span className="text-xs text-muted-foreground">{t.note}</span>
            </button>
          ))}
        </div>
      )}
      <button onClick={save} disabled={!role || busy} className="mt-6 h-14 w-full rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-40">
        {busy ? "Saving…" : "Continue"}
      </button>
    </main>
  );
}
