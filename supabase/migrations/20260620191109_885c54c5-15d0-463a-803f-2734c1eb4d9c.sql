-- =========================================================
-- COUPONS
-- =========================================================
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  min_order numeric NOT NULL DEFAULT 0 CHECK (min_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage coupons"
ON public.coupons FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- SHIPPING SETTINGS (singleton row)
-- =========================================================
CREATE TABLE public.shipping_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  free_shipping_enabled boolean NOT NULL DEFAULT true,
  free_shipping_threshold numeric NOT NULL DEFAULT 2000,
  shipping_fee numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shipping_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shipping_settings TO authenticated;
GRANT ALL ON public.shipping_settings TO service_role;

ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shipping settings"
ON public.shipping_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage shipping settings"
ON public.shipping_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shipping_settings_updated_at
BEFORE UPDATE ON public.shipping_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.shipping_settings (free_shipping_enabled, free_shipping_threshold, shipping_fee)
VALUES (true, 2000, 0);

-- =========================================================
-- ORDERS: add discount / shipping / coupon columns
-- =========================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code text;

-- =========================================================
-- SECURE COUPON FUNCTIONS
-- =========================================================
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _subtotal numeric)
RETURNS TABLE (valid boolean, discount numeric, message text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
  d numeric := 0;
BEGIN
  SELECT * INTO c FROM public.coupons
  WHERE upper(code) = upper(trim(_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::numeric, 'not_found'; RETURN;
  END IF;
  IF NOT c.is_active THEN
    RETURN QUERY SELECT false, 0::numeric, 'inactive'; RETURN;
  END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN QUERY SELECT false, 0::numeric, 'expired'; RETURN;
  END IF;
  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN
    RETURN QUERY SELECT false, 0::numeric, 'limit_reached'; RETURN;
  END IF;
  IF _subtotal < c.min_order THEN
    RETURN QUERY SELECT false, 0::numeric, 'min_order'; RETURN;
  END IF;

  IF c.discount_type = 'percent' THEN
    d := round(_subtotal * c.discount_value / 100.0, 2);
  ELSE
    d := c.discount_value;
  END IF;
  IF d > _subtotal THEN d := _subtotal; END IF;

  RETURN QUERY SELECT true, d, 'ok';
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE upper(code) = upper(trim(_code)) AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text) TO authenticated;