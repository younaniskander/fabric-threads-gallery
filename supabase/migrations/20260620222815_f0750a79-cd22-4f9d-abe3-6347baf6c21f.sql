REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_loyalty_transaction() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage() FROM anon, authenticated;