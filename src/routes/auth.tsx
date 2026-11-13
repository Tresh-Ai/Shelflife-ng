import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ROLES, SELLER_TYPES, type Role, type SellerType } from "@/lib/catalog";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — ShelfLife" }, { name: "description", content: "Sign in to book or drive produce deliveries." }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [role, setRole] = useState<Role>("buyer");
  const [sellerType, setSellerType] = useState<SellerType>("farmer");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/shop", replace: true }));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => s && navigate({ to: "/shop", replace: true }));
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name, mode: role, seller_type: role === "seller" ? sellerType : null } },
      });
      if (error) toast.error(error.message);
      else if (!data.session) setSent(true);
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  }

  const input = "h-14 w-full rounded-xl bg-muted px-4 text-base outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-14 pb-10">
      <div className="flex items-center gap-2 text-lg font-extrabold">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Truck className="size-4" /></span>ShelfLife
      </div>
      {sent ? (
        <div className="mt-16">
          <h1 className="text-3xl font-extrabold tracking-tight">Check your email</h1>
          <p className="mt-3 text-muted-foreground">We sent a link to {email}. Open it to finish signing up.</p>
          <button onClick={() => { setSent(false); setMode("in"); }} className="mt-8 font-semibold underline">Back to sign in</button>
        </div>
      ) : (
        <>
          <h1 className="mt-14 text-3xl font-extrabold tracking-tight">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
          <form onSubmit={submit} className="mt-8 space-y-3">
            {mode === "up" && (
              <>
                <p className="text-sm font-bold">I want to</p>
                <div className="grid gap-2">
                  {ROLES.map((r) => (
                    <button type="button" key={r.id} onClick={() => setRole(r.id)} aria-pressed={role === r.id}
                      className={"rounded-xl border-2 p-3 text-left " + (role === r.id ? "border-primary bg-primary/5" : "border-border")}>
                      <span className="block font-bold">{r.title}</span><span className="text-sm text-muted-foreground">{r.note}</span>
                    </button>
                  ))}
                </div>
                {role === "seller" && (
                  <div className="grid grid-cols-2 gap-2">
                    {SELLER_TYPES.map((t) => (
                      <button type="button" key={t.id} onClick={() => setSellerType(t.id)} aria-pressed={sellerType === t.id}
                        className={"rounded-xl border-2 p-2.5 text-left text-sm " + (sellerType === t.id ? "border-primary bg-primary/5" : "border-border")}>
                        <span className="block font-bold">{t.title}</span><span className="text-xs text-muted-foreground">{t.note}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              </>
            )}
            <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className={input} type="password" placeholder="Password" minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button disabled={busy} className="h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <button onClick={google} className="flex h-14 w-full items-center justify-center gap-[10px] rounded-xl border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F]">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continue with Google
          </button>
          <p className="mt-auto pt-10 text-center text-sm text-muted-foreground">
            {mode === "in" ? "New to ShelfLife? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-bold text-foreground underline">{mode === "in" ? "Create account" : "Sign in"}</button>
          </p>
        </>
      )}
    </main>
  );
}
