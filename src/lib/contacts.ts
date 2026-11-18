import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Contact = { id: string; full_name: string | null; phone: string | null; mode: string; vehicle: string | null };

/**
 * Names and phone numbers for the people on a trip or order, so buyer, driver and
 * seller can each call the others. RLS only returns people you actually trade with.
 */
export function useContacts(ids: Array<string | null | undefined>) {
  const wanted = Array.from(new Set(ids.filter((x): x is string => !!x))).sort();
  const { data } = useQuery({
    queryKey: ["contacts", wanted],
    enabled: wanted.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, mode, vehicle")
        .in("id", wanted);
      if (error) throw error;
      return data as Contact[];
    },
  });
  return (id?: string | null) => (id ? data?.find((p) => p.id === id) ?? null : null);
}
