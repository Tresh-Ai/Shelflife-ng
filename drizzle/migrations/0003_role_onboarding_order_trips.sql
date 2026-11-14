ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_mode_check;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;
UPDATE public.profiles SET onboarded = true;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS order_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS goods_ngn integer NOT NULL DEFAULT 0;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mode, seller_type, onboarded)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          COALESCE(NEW.raw_user_meta_data->>'mode','buyer'),
          NEW.raw_user_meta_data->>'seller_type',
          (NEW.raw_user_meta_data->>'mode') IS NOT NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;