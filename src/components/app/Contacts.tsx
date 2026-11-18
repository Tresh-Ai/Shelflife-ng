import { Phone } from "lucide-react";
import type { Contact } from "@/lib/contacts";

/** Call buttons for everyone on a trip or order: buyer, driver and seller each see the other sides. */
export function ContactList({ people }: { people: { label: string; contact: Contact | null }[] }) {
  const rows = people.filter((p) => p.contact);
  if (rows.length === 0) return null;
  return (
    <div className="mt-5">
      <p className="text-sm font-bold">Contacts</p>
      <ul className="mt-2 divide-y rounded-xl border bg-card">
        {rows.map(({ label, contact }) => {
          const c = contact!;
          const tel = c.phone?.replace(/[^\d+]/g, "");
          return (
            <li key={label} className="flex items-center gap-3 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                {(c.full_name ?? label).slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{c.full_name ?? label}</span>
                <span className="block truncate text-xs text-muted-foreground">{label}{c.phone ? ` · ${c.phone}` : ""}</span>
              </span>
              {tel ? (
                <a href={`tel:${tel}`} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground">
                  <Phone className="size-4" />Call
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">No phone</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
