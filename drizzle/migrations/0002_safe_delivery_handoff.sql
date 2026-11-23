ALTER TABLE public.trips DROP CONSTRAINT trips_status_check;
ALTER TABLE public.trips ADD CONSTRAINT trips_status_check CHECK (status = ANY (ARRAY['searching','accepted','picked_up','arrived','paid','delivered','cancelled']));
CREATE OR REPLACE FUNCTION public.trips_guard_handoff() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = OLD.status OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.status = 'arrived' AND NOT (OLD.status = 'picked_up' AND auth.uid() = OLD.hauler_id) THEN RAISE EXCEPTION 'Only the driver can confirm arrival after pickup'; END IF;
  IF NEW.status = 'paid' AND NOT (OLD.status = 'arrived' AND auth.uid() = OLD.buyer_id) THEN RAISE EXCEPTION 'Only the buyer can confirm payment once the driver has arrived'; END IF;
  IF NEW.status = 'delivered' AND NOT (OLD.status = 'paid' AND auth.uid() = OLD.hauler_id) THEN RAISE EXCEPTION 'The driver hands over only after the buyer has paid'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trips_guard_handoff ON public.trips;
CREATE TRIGGER trips_guard_handoff BEFORE UPDATE OF status ON public.trips FOR EACH ROW EXECUTE FUNCTION public.trips_guard_handoff();