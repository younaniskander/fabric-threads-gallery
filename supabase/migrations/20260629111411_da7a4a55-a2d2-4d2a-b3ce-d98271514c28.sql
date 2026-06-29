-- 1. notifications: restrict creation to admins only (authenticated)
DROP POLICY IF EXISTS "Admins create notifications" ON public.notifications;
CREATE POLICY "Admins create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Revoke anonymous/public EXECUTE on SECURITY DEFINER functions that are
-- not called directly by anonymous clients (used only internally).
REVOKE EXECUTE ON FUNCTION public.get_membership_level(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_in_segment(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_coupon_for_user(text, numeric, uuid) FROM anon, PUBLIC;
