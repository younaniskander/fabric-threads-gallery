-- Trigger-only functions don't need to be directly callable by API roles.
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;