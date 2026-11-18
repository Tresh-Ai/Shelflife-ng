CREATE OR REPLACE FUNCTION public.shares_delivery_with(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.trips t
    where (t.buyer_id = _a or t.hauler_id = _a)
      and (t.buyer_id = _b or t.hauler_id = _b)
  ) or exists (
    select 1 from public.orders o
    where (o.buyer_id = _a and o.seller_id = _b)
       or (o.seller_id = _a and o.buyer_id = _b)
  ) or exists (
    select 1
    from public.orders o
    join public.trips t on o.id = any (t.order_ids)
    where ((o.buyer_id = _a or o.seller_id = _a) and t.hauler_id = _b)
       or ((o.buyer_id = _b or o.seller_id = _b) and t.hauler_id = _a)
  )
$$;

DROP POLICY IF EXISTS "drivers read orders they carry" ON public.orders;
CREATE POLICY "drivers read orders they carry" ON public.orders
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.hauler_id = auth.uid() AND public.orders.id = any (t.order_ids)
  ));