-- Restrict customer registration to authenticated users tied to their own account.
DROP POLICY IF EXISTS "Anyone can register as customer" ON public.customers;

CREATE POLICY "Authenticated users can register as customer"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(trim(name)) > 0
  AND length(name) <= 100
  AND phone IS NOT NULL
  AND length(trim(phone)) > 0
  AND length(phone) <= 20
  AND image_url IS NULL
  AND user_id = auth.uid()
);