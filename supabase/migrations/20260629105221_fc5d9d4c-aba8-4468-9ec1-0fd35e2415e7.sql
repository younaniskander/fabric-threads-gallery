-- ============ NOTIFICATIONS CENTER ============
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins create notifications" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);
CREATE TRIGGER trg_notifications_updated BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============ CRM: CUSTOMER SEGMENTS ============
CREATE TABLE public.customer_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  rule_type text NOT NULL DEFAULT 'points',
  min_value numeric NOT NULL DEFAULT 0,
  max_value numeric,
  color text NOT NULL DEFAULT '#888888',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_segments TO authenticated;
GRANT ALL ON public.customer_segments TO service_role;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Segments readable by staff" ON public.customer_segments FOR SELECT USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'crm.view'));
CREATE POLICY "Admins manage segments" ON public.customer_segments FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_segments_updated BEFORE UPDATE ON public.customer_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ WHATSAPP AUTOMATION ============
CREATE TABLE public.whatsapp_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  trigger_event text NOT NULL DEFAULT 'manual',
  body_ar text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_templates TO authenticated;
GRANT ALL ON public.whatsapp_templates TO service_role;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "WA templates readable by staff" ON public.whatsapp_templates FOR SELECT USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'whatsapp.view'));
CREATE POLICY "Admins manage WA templates" ON public.whatsapp_templates FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wa_templates_updated BEFORE UPDATE ON public.whatsapp_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.whatsapp_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  phone text NOT NULL DEFAULT '',
  template_key text,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_logs TO authenticated;
GRANT ALL ON public.whatsapp_logs TO service_role;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "WA logs readable by staff" ON public.whatsapp_logs FOR SELECT USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'whatsapp.view'));
CREATE POLICY "Staff insert WA logs" ON public.whatsapp_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'whatsapp.send'));
CREATE POLICY "Admins manage WA logs" ON public.whatsapp_logs FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ADVANCED COUPON ENGINE ============
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS per_user_limit integer;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS segment_key text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

CREATE TABLE public.coupon_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid,
  discount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own redemptions" ON public.coupon_redemptions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own redemptions" ON public.coupon_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage redemptions" ON public.coupon_redemptions FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_coupon_redemptions_user ON public.coupon_redemptions(user_id, coupon_code);

-- Enhanced coupon validation honoring schedule + per-user limit
CREATE OR REPLACE FUNCTION public.validate_coupon_for_user(_code text, _subtotal numeric, _user_id uuid)
RETURNS TABLE(valid boolean, discount numeric, message text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coupons%ROWTYPE; d numeric := 0; user_uses integer := 0;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(trim(_code)) LIMIT 1;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 0::numeric, 'not_found'; RETURN; END IF;
  IF NOT c.is_active THEN RETURN QUERY SELECT false, 0::numeric, 'inactive'; RETURN; END IF;
  IF c.starts_at IS NOT NULL AND c.starts_at > now() THEN RETURN QUERY SELECT false, 0::numeric, 'not_started'; RETURN; END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN RETURN QUERY SELECT false, 0::numeric, 'expired'; RETURN; END IF;
  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN RETURN QUERY SELECT false, 0::numeric, 'limit_reached'; RETURN; END IF;
  IF _subtotal < c.min_order THEN RETURN QUERY SELECT false, 0::numeric, 'min_order'; RETURN; END IF;
  IF c.per_user_limit IS NOT NULL AND _user_id IS NOT NULL THEN
    SELECT count(*) INTO user_uses FROM public.coupon_redemptions WHERE user_id = _user_id AND upper(coupon_code) = upper(trim(_code));
    IF user_uses >= c.per_user_limit THEN RETURN QUERY SELECT false, 0::numeric, 'user_limit'; RETURN; END IF;
  END IF;
  IF c.segment_key IS NOT NULL AND c.segment_key <> '' AND _user_id IS NOT NULL THEN
    IF NOT public.user_in_segment(_user_id, c.segment_key) THEN RETURN QUERY SELECT false, 0::numeric, 'segment'; RETURN; END IF;
  END IF;
  IF c.discount_type = 'percent' THEN d := round(_subtotal * c.discount_value / 100.0, 2); ELSE d := c.discount_value; END IF;
  IF d > _subtotal THEN d := _subtotal; END IF;
  RETURN QUERY SELECT true, d, 'ok';
END; $$;

-- ============ PER-BRANCH INVENTORY ============
CREATE TABLE public.branch_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  fabric_id uuid NOT NULL REFERENCES public.fabrics_db(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, fabric_id)
);
GRANT SELECT ON public.branch_inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branch_inventory TO authenticated;
GRANT ALL ON public.branch_inventory TO service_role;
ALTER TABLE public.branch_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory readable by everyone" ON public.branch_inventory FOR SELECT USING (true);
CREATE POLICY "Staff manage inventory" ON public.branch_inventory FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'inventory.manage')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'inventory.manage'));
CREATE TRIGGER trg_branch_inventory_updated BEFORE UPDATE ON public.branch_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEGMENT HELPER ============
CREATE OR REPLACE FUNCTION public.user_in_segment(_user_id uuid, _segment_key text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.customer_segments%ROWTYPE; metric numeric := 0;
BEGIN
  SELECT * INTO s FROM public.customer_segments WHERE key = _segment_key AND is_active LIMIT 1;
  IF NOT FOUND THEN RETURN false; END IF;
  IF s.rule_type = 'points' THEN
    SELECT COALESCE(loyalty_points,0) INTO metric FROM public.profiles WHERE id = _user_id;
  ELSIF s.rule_type = 'spend' THEN
    SELECT COALESCE(sum(total_amount),0) INTO metric FROM public.orders WHERE user_id = _user_id AND status NOT IN ('cancelled','returned','refunded','rejected');
  ELSIF s.rule_type = 'orders' THEN
    SELECT count(*) INTO metric FROM public.orders WHERE user_id = _user_id AND status NOT IN ('cancelled','returned','refunded','rejected');
  ELSE
    RETURN false;
  END IF;
  RETURN metric >= s.min_value AND (s.max_value IS NULL OR metric <= s.max_value);
END; $$;
