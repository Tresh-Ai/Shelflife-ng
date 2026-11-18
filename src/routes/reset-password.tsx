import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — ShelfLife" }, { name: "description", content: "Choose a new password for your ShelfLife account." }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  // Only the link we emailed counts: it arrives with type=recovery in the address.
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/dispatch" });
  }

  const input = "h-14 w-full rounded-xl bg-muted px-4 text-base outline-none focus:ring-2 focus:ring-ring";

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Use the link in your email</h1>
        <p className="mt-3 text-muted-foreground">This page only opens from the password reset link we sent you.</p>
        <Link to="/auth" className="mt-8 font-bold underline">Back to sign in</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Choose a new password</h1>
      <p className="mt-3 text-muted-foreground">At least 6 characters.</p>
      <form onSubmit={save} className="mt-8 space-y-3">
        <input className={input} type="password" placeholder="New password" minLength={6} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <button disabled={busy} className="h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60">
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </main>
  );
}
