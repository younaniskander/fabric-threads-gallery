-- Remove the user-callable redeem function in favor of an automatic trigger
DROP FUNCTION IF EXISTS public.redeem_coupon(text);

CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL AND length(trim(NEW.coupon_code)) > 0 THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE upper(code) = upper(trim(NEW.coupon_code)) AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_increment_coupon_usage
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_usage();