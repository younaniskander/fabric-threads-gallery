
-- =========================================================
-- HELPERS / SHARED
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- =========================================================
-- 1. MODULES REGISTRY (plugin-based on/off)
-- =========================================================
CREATE TABLE public.app_modules (
  key text PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  description text DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_modules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_modules TO authenticated;
GRANT ALL ON public.app_modules TO service_role;
ALTER TABLE public.app_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules readable by everyone" ON public.app_modules FOR SELECT USING (true);
CREATE POLICY "Admins manage modules" ON public.app_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_app_modules_updated BEFORE UPDATE ON public.app_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_modules (key,name,name_ar,description,enabled,sort_order) VALUES
  ('loyalty','Loyalty Engine','محرك الولاء','نقاط الولاء وقواعد الكسب والاستبدال',true,10),
  ('qr_card','QR Loyalty Card','بطاقة الولاء QR','بطاقة عضوية برمز QR لكل عميل',true,20),
  ('pos','Point of Sale','نقطة البيع','كاشير متصل بنفس قاعدة البيانات',true,30),
  ('rbac','Roles & Permissions','الأدوار والصلاحيات','تحكم كامل في صلاحيات الموظفين',true,40),
  ('branches','Multi Branch','إدارة الفروع','دعم عدد غير محدود من الفروع',true,50),
  ('coupons','Coupon Engine','محرك الكوبونات','نظام كوبونات متقدم',true,60),
  ('whatsapp','WhatsApp Automation','أتمتة واتساب','رسائل تلقائية عبر واتساب',false,70),
  ('crm','Customer Segmentation','تقسيم العملاء','تجميع العملاء حسب السلوك',false,80),
  ('reports','Reporting System','نظام التقارير','تقارير احترافية وتصدير',false,90),
  ('recommendations','Recommendations','التوصيات الذكية','اقتراح المنتجات',false,100),
  ('notifications','Notifications Center','مركز الإشعارات','واتساب/بريد/إشعارات داخل التطبيق',false,110),
  ('audit','Audit Log','سجل التدقيق','تتبع كل إجراء في النظام',true,120);

-- =========================================================
-- 2. BRANCHES
-- =========================================================
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  code text UNIQUE,
  address text DEFAULT '',
  city text DEFAULT '',
  phone text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branches readable by everyone" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Admins manage branches" ON public.branches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.branches (name,name_ar,code,city) VALUES
  ('Desouk Branch','فرع دسوق','DSK','دسوق'),
  ('Kafr El-Sheikh Branch','فرع كفر الشيخ','KFS','كفر الشيخ');

-- =========================================================
-- 3. RBAC: roles, permissions, role_permissions, staff_assignments
-- =========================================================
CREATE TABLE public.roles (
  key text PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  description text DEFAULT '',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles readable by staff" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles table" ON public.roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.roles (key,name,name_ar,is_system) VALUES
  ('super_admin','Super Admin','مدير عام',true),
  ('branch_manager','Branch Manager','مدير فرع',true),
  ('cashier','Cashier','كاشير',true),
  ('warehouse_manager','Warehouse Manager','مدير مخزن',true),
  ('marketing_manager','Marketing Manager','مدير تسويق',true),
  ('customer_support','Customer Support','دعم العملاء',true),
  ('accountant','Accountant','محاسب',true);

CREATE TABLE public.permissions (
  key text PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general'
);
GRANT SELECT ON public.permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissions readable by staff" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage permissions" ON public.permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.permissions (key,name,name_ar,category) VALUES
  ('customers.view','View Customers','عرض العملاء','customers'),
  ('customers.edit','Edit Customers','تعديل العملاء','customers'),
  ('loyalty.redeem','Redeem Points','استبدال النقاط','loyalty'),
  ('loyalty.add_bonus','Add Bonus Points','إضافة نقاط مكافأة','loyalty'),
  ('loyalty.edit_rules','Edit Loyalty Rules','تعديل قواعد الولاء','loyalty'),
  ('orders.view','View Orders','عرض الطلبات','orders'),
  ('orders.refund','Refund Orders','استرجاع الطلبات','orders'),
  ('pos.use','Use POS','استخدام الكاشير','pos'),
  ('pos.returns','POS Returns/Exchanges','مرتجعات الكاشير','pos'),
  ('reports.export','Export Reports','تصدير التقارير','reports'),
  ('reports.view','View Analytics','عرض التحليلات','reports'),
  ('campaigns.manage','Manage Campaigns','إدارة الحملات','marketing'),
  ('whatsapp.manage','Manage WhatsApp','إدارة واتساب','marketing'),
  ('branches.manage','Manage Branches','إدارة الفروع','branches'),
  ('inventory.manage','Manage Inventory','إدارة المخزون','inventory'),
  ('employees.manage','Manage Employees','إدارة الموظفين','staff'),
  ('coupons.manage','Manage Coupons','إدارة الكوبونات','marketing'),
  ('settings.manage','Manage Settings','إدارة الإعدادات','system');

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL REFERENCES public.roles(key) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  UNIQUE (role_key, permission_key)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Role perms readable by staff" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage role perms" ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed default role permissions
INSERT INTO public.role_permissions (role_key, permission_key)
SELECT 'super_admin', key FROM public.permissions;
INSERT INTO public.role_permissions (role_key, permission_key) VALUES
  ('branch_manager','customers.view'),('branch_manager','orders.view'),('branch_manager','orders.refund'),
  ('branch_manager','pos.use'),('branch_manager','pos.returns'),('branch_manager','reports.view'),
  ('branch_manager','inventory.manage'),('branch_manager','loyalty.redeem'),('branch_manager','loyalty.add_bonus'),
  ('cashier','customers.view'),('cashier','pos.use'),('cashier','loyalty.redeem'),('cashier','orders.view'),
  ('warehouse_manager','inventory.manage'),('warehouse_manager','orders.view'),
  ('marketing_manager','campaigns.manage'),('marketing_manager','whatsapp.manage'),('marketing_manager','coupons.manage'),('marketing_manager','reports.view'),
  ('customer_support','customers.view'),('customer_support','orders.view'),('customer_support','loyalty.redeem'),
  ('accountant','reports.view'),('accountant','reports.export'),('accountant','orders.view');

CREATE TABLE public.staff_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key text NOT NULL REFERENCES public.roles(key) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_key, branch_id)
);
GRANT SELECT ON public.staff_assignments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.staff_assignments TO authenticated;
GRANT ALL ON public.staff_assignments TO service_role;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read own assignments" ON public.staff_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage assignments" ON public.staff_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- permission check helper
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _perm text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'admin') OR EXISTS (
    SELECT 1 FROM public.staff_assignments sa
    JOIN public.role_permissions rp ON rp.role_key = sa.role_key
    WHERE sa.user_id = _user_id AND rp.permission_key = _perm
  );
$$;

-- =========================================================
-- 4. MEMBERSHIP LEVELS + LOYALTY RULES
-- =========================================================
CREATE TABLE public.membership_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  min_points integer NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#9ca3af',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.membership_levels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.membership_levels TO authenticated;
GRANT ALL ON public.membership_levels TO service_role;
ALTER TABLE public.membership_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Levels readable by everyone" ON public.membership_levels FOR SELECT USING (true);
CREATE POLICY "Admins manage levels" ON public.membership_levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.membership_levels (key,name,name_ar,min_points,discount_percent,color,sort_order) VALUES
  ('bronze','Bronze','برونزي',0,0,'#cd7f32',1),
  ('silver','Silver','فضي',500,3,'#9ca3af',2),
  ('gold','Gold','ذهبي',2000,5,'#d4af37',3),
  ('platinum','Platinum','بلاتيني',5000,10,'#6b7280',4);

CREATE TABLE public.loyalty_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_currency numeric NOT NULL DEFAULT 1,
  point_value numeric NOT NULL DEFAULT 0.1,
  min_redeem_points integer NOT NULL DEFAULT 100,
  award_on_status text NOT NULL DEFAULT 'delivered',
  points_expiry_days integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.loyalty_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.loyalty_rules TO authenticated;
GRANT ALL ON public.loyalty_rules TO service_role;
ALTER TABLE public.loyalty_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rules readable by everyone" ON public.loyalty_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage loyalty rules" ON public.loyalty_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.loyalty_rules (points_per_currency,point_value,min_redeem_points,award_on_status) VALUES (1,0.1,100,'delivered');

CREATE OR REPLACE FUNCTION public.get_membership_level(_points integer)
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT key FROM public.membership_levels
  WHERE min_points <= COALESCE(_points,0)
  ORDER BY min_points DESC LIMIT 1;
$$;

-- =========================================================
-- 5. PROFILES: loyalty card token + membership + branch
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loyalty_card_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS membership_level text NOT NULL DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_loyalty_card_token_key ON public.profiles(loyalty_card_token);

-- staff with customers.view can read profiles (for QR scan / lookup)
CREATE POLICY "Staff can view customer profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(),'customers.view'));

-- keep membership level in sync whenever points change
CREATE OR REPLACE FUNCTION public.apply_loyalty_transaction()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_points integer;
BEGIN
  UPDATE public.profiles
  SET loyalty_points = GREATEST(0, loyalty_points + NEW.points),
      updated_at = now()
  WHERE id = NEW.user_id
  RETURNING loyalty_points INTO new_points;

  UPDATE public.profiles
  SET membership_level = public.get_membership_level(new_points)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- =========================================================
-- 6. ORDERS <-> LOYALTY SYNCHRONIZATION
-- =========================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS points_earned integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_redeemed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_settled boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.sync_order_loyalty()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.loyalty_rules%ROWTYPE; earn integer;
BEGIN
  SELECT * INTO r FROM public.loyalty_rules LIMIT 1;
  IF r.id IS NULL OR NOT r.enabled THEN RETURN NEW; END IF;

  -- Award points when reaching the configured status
  IF NEW.status = r.award_on_status AND NOT COALESCE(NEW.loyalty_settled,false) THEN
    earn := floor(COALESCE(NEW.subtotal, NEW.total_amount, 0) * r.points_per_currency);
    IF earn > 0 THEN
      INSERT INTO public.loyalty_transactions(user_id,points,type,reason)
      VALUES (NEW.user_id, earn, 'earn', 'order:'||NEW.id);
      NEW.points_earned := earn;
    END IF;
    NEW.loyalty_settled := true;
  END IF;

  -- Reverse on cancel/return/refund/reject
  IF NEW.status IN ('cancelled','returned','refunded','rejected') THEN
    IF COALESCE(NEW.points_earned,0) > 0 THEN
      INSERT INTO public.loyalty_transactions(user_id,points,type,reason)
      VALUES (NEW.user_id, -NEW.points_earned, 'reverse', 'order_reversed:'||NEW.id);
      NEW.points_earned := 0;
    END IF;
    IF COALESCE(NEW.points_redeemed,0) > 0 THEN
      INSERT INTO public.loyalty_transactions(user_id,points,type,reason)
      VALUES (NEW.user_id, NEW.points_redeemed, 'refund_redeem', 'redeem_returned:'||NEW.id);
      NEW.points_redeemed := 0;
    END IF;
    NEW.loyalty_settled := false;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_order_loyalty
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_order_loyalty();

-- =========================================================
-- 7. POS SALES
-- =========================================================
CREATE TABLE public.pos_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  cashier_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  payments jsonb NOT NULL DEFAULT '[]'::jsonb,
  points_earned integer NOT NULL DEFAULT 0,
  points_redeemed integer NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'sale',
  related_sale_id uuid REFERENCES public.pos_sales(id) ON DELETE SET NULL,
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_sales TO authenticated;
GRANT ALL ON public.pos_sales TO service_role;
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view pos sales" ON public.pos_sales FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(),'pos.use'));
CREATE POLICY "Staff create pos sales" ON public.pos_sales FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(),'pos.use') AND cashier_id = auth.uid());
CREATE POLICY "Staff update pos sales" ON public.pos_sales FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'pos.use')) WITH CHECK (public.has_permission(auth.uid(),'pos.use'));
CREATE POLICY "Admins delete pos sales" ON public.pos_sales FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- receipt number generator
CREATE SEQUENCE IF NOT EXISTS public.pos_receipt_seq START 1000;
CREATE OR REPLACE FUNCTION public.set_pos_receipt_no()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.receipt_no IS NULL THEN
    NEW.receipt_no := 'R-' || to_char(now(),'YYMMDD') || '-' || nextval('public.pos_receipt_seq');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_pos_receipt_no BEFORE INSERT ON public.pos_sales
  FOR EACH ROW EXECUTE FUNCTION public.set_pos_receipt_no();

-- =========================================================
-- 8. AUDIT LOG
-- =========================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Authenticated can write audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
