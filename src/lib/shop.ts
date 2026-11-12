import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/trips";
import { categoryImage, setLineQty, type CartLine } from "@/lib/catalog";

export function useProfile() {
  const me = useUserId();
  return useQuery({
    queryKey: ["profile", me],
    enabled: !!me,
    queryFn: async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", me!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", me!),
      ]);
      return { ...p, id: me!, mode: (p?.mode ?? "buyer") as "buyer" | "driver" | "seller", isAdmin: !!r?.some((x) => x.role === "admin") };
    },
  });
}

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("markets").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useImage(path: string | null | undefined, category: string) {
  const { data } = useQuery({
    queryKey: ["img", path],
    enabled: !!path,
    staleTime: 50 * 60_000,
    queryFn: async () => (await supabase.storage.from("product-images").createSignedUrl(path!, 3600)).data?.signedUrl ?? null,
  });
  return data ?? categoryImage(category);
}

// Cart in localStorage, shared across screens
const KEY = "sl-cart";
const subs = new Set<() => void>();
let cache: CartLine[] | null = null;
function read(): CartLine[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { cache = []; }
  return cache!;
}
const EMPTY: CartLine[] = [];
function write(lines: CartLine[]) {
  cache = lines; localStorage.setItem(KEY, JSON.stringify(lines)); subs.forEach((f) => f());
}
export function useCart() {
  const lines = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, read, () => EMPTY);
  return {
    lines,
    set: (line: Omit<CartLine, "qty">, qty: number, stock: number) => write(setLineQty(read(), line, qty, stock)),
    clear: () => write([]),
  };
}
