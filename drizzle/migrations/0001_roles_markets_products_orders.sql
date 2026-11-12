ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS market_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- mode: buyer | driver | seller ; only these self-selectable
CREATE OR REPLACE FUNCTION public.profiles_validate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.mode NOT IN ('buyer','driver','seller') THEN NEW.mode := 'buyer'; END IF;
  IF NEW.seller_type IS NOT NULL AND NEW.seller_type NOT IN ('farmer','storage','distributor','vendor') THEN NEW.seller_type := NULL; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_validate BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_validate();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mode, seller_type)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name',
          COALESCE(NEW.raw_user_meta_data->>'mode','buyer'),
          NEW.raw_user_meta_data->>'seller_type')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TABLE public.markets (
  id text PRIMARY KEY,
  name text NOT NULL,
  area text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.markets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.markets TO authenticated;
GRANT ALL ON public.markets TO service_role;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "markets readable" ON public.markets FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage markets" ON public.markets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.markets (id,name,area,lat,lng) VALUES
 ('mile12','Mile 12 Market','Kosofe',6.6036,3.3967),
 ('ketu','Ketu Fruit Market','Ketu',6.5965,3.3891),
 ('oyingbo','Oyingbo Market','Ebute Metta',6.4855,3.3849),
 ('ikotun','Ikotun Market','Alimosho',6.5498,3.2649),
 ('badagry','Badagry Farm Gate','Badagry',6.4316,2.8876),
 ('epe','Epe Produce Hub','Epe',6.5841,3.9834),
 ('lekki','Lekki Market','Lekki',6.4474,3.4723),
 ('ikeja','Ikeja Market','Ikeja',6.5818,3.3561),
 ('yaba','Yaba Market','Yaba',6.5158,3.3719),
 ('mushin','Mushin Market','Mushin',6.5333,3.3500),
 ('agege','Agege Market','Agege',6.6180,3.3209),
 ('ikorodu','Ikorodu Market','Ikorodu',6.6194,3.5105);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  market_id text NOT NULL REFERENCES public.markets(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Vegetables',
  unit text NOT NULL DEFAULT 'bag',
  price_ngn integer NOT NULL CHECK (price_ngn >= 0),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "sellers add own" ON public.products FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "sellers edit own" ON public.products FOR UPDATE TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "sellers or admin delete" ON public.products FOR DELETE TO authenticated USING (seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  market_id text NOT NULL,
  items jsonb NOT NULL,
  total_ngn integer NOT NULL,
  status text NOT NULL DEFAULT 'placed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order parties read" ON public.orders FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "seller updates status" ON public.orders FOR UPDATE TO authenticated
  USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

-- Checkout: items = [{product_id, qty}], creates one order per seller and reduces stock atomically
CREATE OR REPLACE FUNCTION public.place_order(_items jsonb) RETURNS SETOF uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it jsonb; p public.products; q int; oid uuid; s record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
  CREATE TEMP TABLE _lines (seller_id uuid, market_id text, line jsonb, amount int) ON COMMIT DROP;
  FOR it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    q := (it->>'qty')::int;
    IF q IS NULL OR q < 1 THEN RAISE EXCEPTION 'Bad quantity'; END IF;
    SELECT * INTO p FROM public.products WHERE id = (it->>'product_id')::uuid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product no longer listed'; END IF;
    IF p.quantity < q THEN RAISE EXCEPTION 'Only % % of % left', p.quantity, p.unit, p.name; END IF;
    UPDATE public.products SET quantity = quantity - q, updated_at = now() WHERE id = p.id;
    INSERT INTO _lines VALUES (p.seller_id, p.market_id,
      jsonb_build_object('product_id',p.id,'name',p.name,'unit',p.unit,'qty',q,'price_ngn',p.price_ngn), p.price_ngn*q);
  END LOOP;
  FOR s IN SELECT seller_id, market_id, jsonb_agg(line) items, sum(amount)::int total FROM _lines GROUP BY seller_id, market_id LOOP
    INSERT INTO public.orders (buyer_id, seller_id, market_id, items, total_ngn)
    VALUES (auth.uid(), s.seller_id, s.market_id, s.items, s.total) RETURNING id INTO oid;
    RETURN NEXT oid;
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

CREATE POLICY "product images public read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "users upload own product images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users delete own product images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);