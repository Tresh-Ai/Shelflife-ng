import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Truck, MapPin, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShelfLife — Book a produce hauler in minutes" },
      { name: "description", content: "Request a bike, van or cold truck to move your produce across Lagos. Live map, upfront price, real haulers." },
      { property: "og:title", content: "ShelfLife — Book a produce hauler in minutes" },
      { property: "og:description", content: "Uber for farm produce. Request a hauler, see the price upfront and track the delivery live." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dispatch", replace: true });
    });
  }, [navigate]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-14">
      <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Truck className="size-4" /></span>
        ShelfLife
      </div>
      <h1 className="mt-16 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight">
        Move produce<br />before it spoils.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">Uber for farm produce. Pick up, drop off, done.</p>

      <ul className="mt-10 space-y-5 text-[15px]">
        <li className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0" /> Choose pickup and drop-off on a real map</li>
        <li className="flex gap-3"><Truck className="mt-0.5 size-5 shrink-0" /> Bike, van or cold truck with the price upfront</li>
        <li className="flex gap-3"><Radio className="mt-0.5 size-5 shrink-0" /> Follow your hauler live until delivery</li>
      </ul>

      <div className="mt-auto space-y-3 pt-12">
        <Link to="/auth" className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
          Get started
        </Link>
        <p className="text-center text-sm text-muted-foreground">Haulers sign up with the same account.</p>
      </div>
    </main>
  );
}
