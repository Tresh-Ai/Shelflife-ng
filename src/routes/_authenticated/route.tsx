import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { MapPin, ListOrdered, Truck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const tabs = [
  { to: "/dispatch", label: "Request", icon: MapPin },
  { to: "/trips", label: "Trips", icon: ListOrdered },
  { to: "/jobs", label: "Drive", icon: Truck },
  { to: "/account", label: "Account", icon: User },
] as const;

function Shell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <div className="flex-1 pb-20"><Outlet /></div>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-[1000] border-t bg-card">
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="flex flex-col items-center gap-1 pt-2.5 pb-1 text-[11px] font-semibold text-muted-foreground" activeProps={{ className: "!text-foreground" }}>
                <Icon className="size-5" />{label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
