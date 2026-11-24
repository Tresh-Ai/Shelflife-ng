ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_lat double precision,
  ADD COLUMN IF NOT EXISTS store_lng double precision;