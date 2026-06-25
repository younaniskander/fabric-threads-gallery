-- FINDING 1: SECURITY DEFINER trigger functions should not be directly executable by API roles.
-- These run only as triggers, so revoke EXECUTE from anon/authenticated/public.
-- has_role and validate_coupon are intentionally invokable (RLS + coupon RPC) and are left untouched.
REVOKE EXECUTE ON FUNCTION public.apply_loyalty_transaction() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage() FROM PUBLIC, anon, authenticated;

-- FINDING 2: Give the customers table an owner reference so authenticated users'
-- records can be scoped to them, while keeping the public lead-capture form working.
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Tighten the public insert policy: a row may only carry a user_id that belongs
-- to the person inserting it (anonymous visitors must leave it null).
DROP POLICY IF EXISTS "Anyone can register as customer" ON public.customers;
CREATE POLICY "Anyone can register as customer"
ON public.customers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(trim(name)) > 0
  AND length(name) <= 100
  AND phone IS NOT NULL
  AND length(trim(phone)) > 0
  AND length(phone) <= 20
  AND image_url IS NULL
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Let authenticated users read their own customer record (owner scoping).
DROP POLICY IF EXISTS "Users can view their own customer record" ON public.customers;
CREATE POLICY "Users can view their own customer record"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);