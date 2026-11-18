-- 1. Account records keep the email so admins can identify people.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Restore the sign-up hook: every new account gets a record with its email and chosen role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mode, seller_type, onboarded)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mode','buyer'),
    NEW.raw_user_meta_data->>'seller_type',
    (NEW.raw_user_meta_data->>'mode') IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET email = COALESCE(public.profiles.email, EXCLUDED.email);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Helpers used by the access rules below.
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
  )
$$;

CREATE OR REPLACE FUNCTION public.trip_carries_order(_trip_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.trips t
    join public.orders o on o.id = any (t.order_ids)
    where t.id = _trip_id and (o.seller_id = _user_id or o.buyer_id = _user_id)
  )
$$;

GRANT EXECUTE ON FUNCTION public.shares_delivery_with(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.trip_carries_order(uuid, uuid) TO authenticated;

-- 4. Personal details only to yourself, admins, and people you trade with.
DROP POLICY IF EXISTS "profiles readable by signed in" ON public.profiles;
CREATE POLICY "profiles readable by people you trade with" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.shares_delivery_with(auth.uid(), id)
  );

-- 5. A seller or buyer can follow the delivery carrying their order; admins see every delivery.
DROP POLICY IF EXISTS "order parties follow their deliveries" ON public.trips;
CREATE POLICY "order parties follow their deliveries" ON public.trips
  FOR SELECT TO authenticated
  USING (public.trip_carries_order(id, auth.uid()));

DROP POLICY IF EXISTS "admins see all trips" ON public.trips;
CREATE POLICY "admins see all trips" ON public.trips
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update trips" ON public.trips;
CREATE POLICY "admins update trips" ON public.trips
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Admins manage the admin badge, listings and order status.
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS "admins grant roles" ON public.user_roles;
CREATE POLICY "admins grant roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins remove roles" ON public.user_roles;
CREATE POLICY "admins remove roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update products" ON public.products;
CREATE POLICY "admins update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update orders" ON public.orders;
CREATE POLICY "admins update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Live changes for trips, listings and orders.
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;