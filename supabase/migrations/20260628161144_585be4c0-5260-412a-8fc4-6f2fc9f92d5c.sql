-- Enforce order financial amounts server-side to prevent client tampering.
CREATE OR REPLACE FUNCTION public.enforce_order_amounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subtotal numeric := GREATEST(0, COALESCE(NEW.subtotal, 0));
  v_discount numeric := 0;
  v_valid boolean := false;
  v_after numeric;
  v_shipping numeric := 0;
  s public.shipping_settings%ROWTYPE;
BEGIN
  -- Re-validate any coupon server-side; clear it if invalid.
  IF NEW.coupon_code IS NOT NULL AND length(trim(NEW.coupon_code)) > 0 THEN
    SELECT vc.valid, vc.discount INTO v_valid, v_discount
    FROM public.validate_coupon(NEW.coupon_code, v_subtotal) vc;
    IF NOT COALESCE(v_valid, false) THEN
      NEW.coupon_code := NULL;
      v_discount := 0;
    END IF;
  END IF;

  IF v_discount > v_subtotal THEN v_discount := v_subtotal; END IF;
  IF v_discount < 0 THEN v_discount := 0; END IF;
  NEW.discount_amount := v_discount;
  v_after := GREATEST(0, v_subtotal - v_discount);

  -- Recompute shipping from authoritative settings.
  SELECT * INTO s FROM public.shipping_settings LIMIT 1;
  IF FOUND THEN
    IF s.free_shipping_enabled AND v_after >= s.free_shipping_threshold THEN
      v_shipping := 0;
    ELSE
      v_shipping := GREATEST(0, COALESCE(s.shipping_fee, 0));
    END IF;
  ELSE
    v_shipping := GREATEST(0, COALESCE(NEW.shipping_amount, 0));
  END IF;
  NEW.shipping_amount := v_shipping;

  NEW.total_amount := v_after + v_shipping;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_order_amounts() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_order_amounts_before_insert ON public.orders;
CREATE TRIGGER enforce_order_amounts_before_insert
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_amounts();