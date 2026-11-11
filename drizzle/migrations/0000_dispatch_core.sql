CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  mode text NOT NULL DEFAULT 'buyer' CHECK (mode IN ('buyer','hauler')),
  vehicle text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by signed in" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  hauler_id uuid,
  pickup_name text NOT NULL,
  pickup_lat double precision NOT NULL,
  pickup_lng double precision NOT NULL,
  dropoff_name text NOT NULL,
  dropoff_lat double precision NOT NULL,
  dropoff_lng double precision NOT NULL,
  produce text NOT NULL,
  crates integer NOT NULL CHECK (crates > 0 AND crates <= 500),
  vehicle text NOT NULL,
  distance_km numeric NOT NULL,
  price_ngn integer NOT NULL,
  status text NOT NULL DEFAULT 'searching' CHECK (status IN ('searching','accepted','picked_up','delivered','cancelled')),
  hauler_lat double precision,
  hauler_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see own or open trips" ON public.trips FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR hauler_id = auth.uid() OR (status = 'searching' AND hauler_id IS NULL));
CREATE POLICY "buyers create trips" ON public.trips FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid() AND hauler_id IS NULL AND status = 'searching');
CREATE POLICY "participants or claim open" ON public.trips FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR hauler_id = auth.uid() OR (status = 'searching' AND hauler_id IS NULL))
  WITH CHECK (buyer_id = auth.uid() OR hauler_id = auth.uid());

CREATE OR REPLACE FUNCTION public.trips_touch() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER trips_touch BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.trips_touch();

ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;