
CREATE POLICY "POS staff can insert loyalty transactions"
ON public.loyalty_transactions FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'pos.use'));
