-- 1. app_modules: restrict read to authenticated users only
DROP POLICY IF EXISTS "Modules readable by everyone" ON public.app_modules;
CREATE POLICY "Modules readable by authenticated"
  ON public.app_modules
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. loyalty_rules: restrict read to authenticated users only
DROP POLICY IF EXISTS "Rules readable by everyone" ON public.loyalty_rules;
CREATE POLICY "Loyalty rules readable by authenticated"
  ON public.loyalty_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. audit_logs: prevent users from writing arbitrary audit entries.
-- Remove the direct INSERT policy and revoke INSERT so only SECURITY DEFINER
-- routines (running as table owner) can write audit entries.
DROP POLICY IF EXISTS "Authenticated can write audit logs" ON public.audit_logs;
REVOKE INSERT ON public.audit_logs FROM authenticated;
REVOKE INSERT ON public.audit_logs FROM anon;

-- 4. customers: allow staff lookups + self/staff updates
CREATE POLICY "Staff can view customers"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'customers.view'));

CREATE POLICY "Users can update their own customer record"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update customers"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (public.has_permission(auth.uid(), 'customers.edit'))
  WITH CHECK (public.has_permission(auth.uid(), 'customers.edit'));
