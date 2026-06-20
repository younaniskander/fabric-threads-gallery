## الخطة

### 1) قاعدة البيانات — migration
- إضافة أعمدة جديدة لجدول `orders`:
  - `customer_name` (نص، مطلوب)
  - `customer_phone` (نص، مطلوب)
  - `customer_address` (نص، مطلوب)
  - `notes` (نص، اختياري)
- تثبيت الحالات المسموحة: `pending` / `delivered` / `cancelled` (بدلاً من `paid`).
- سياسة جديدة: الأدمن يقدر يقرأ كل الطلبات ويحدّث الحالة (عبر `has_role(auth.uid(),'admin')`).
- المستخدم يقدر يشوف طلباته فقط (موجود).

### 2) إلغاء الدفع الإلكتروني (Stripe)
- حذف استدعاء `create-checkout` من `CartDrawer.tsx`.
- استبدال زر "ادفع" بنموذج (Dialog) يطلب:
  - الاسم (Prefilled من البروفايل)
  - رقم الهاتف (Prefilled)
  - العنوان بالتفصيل
  - ملاحظات اختيارية
- عند التأكيد: إنشاء صف في `orders` بالحالة `pending`، تفريغ السلة، تحويل لصفحة نجاح بسيطة.
- صفحة `PaymentSuccess` تبقى لكن النص يتغير لـ "تم استلام طلبك وسنتواصل معك".
- إزالة `PaymentMethods` من صفحة الفابريك التفصيلية (اختياري — أو تحويلها لتعرض "الدفع عند الاستلام" فقط).
- حذف edge function `create-checkout` ومرجعها.

### 3) لوحة الأدمن — قسم "الطلبات"
إضافة تبويب جديد `orders` في `AdminDashboard.tsx` مع 3 أقسام فرعية (Tabs داخلية):
- **قيد التنفيذ** (`pending`) — أزرار: "تم التسليم" / "إلغاء"
- **تم التسليم** (`delivered`)
- **ملغية** (`cancelled`)

كل قسم:
- مجموعات حسب اليوم (تاريخ تنازلي).
- لكل يوم: عدد الطلبات + مجموع الفلوس.
- إجمالي عام أعلى القسم.
- كل طلب يعرض: اسم العميل، الهاتف، العنوان، المنتجات، المبلغ، الوقت.

### تفاصيل تقنية
- Migration واحدة: ALTER TABLE + سياسة admin update.
- استعلام واحد في الأدمن: `select * from orders order by created_at desc` ثم grouping client-side بالـ `date-fns`.
- استخدام `useQuery` مع invalidate بعد تحديث الحالة.
- حذف `stripe_session_id` لا يُعمل (نتركه لتجنب فقد بيانات قديمة).

### ملفات هتتعدل / تتنشئ
- `supabase/migrations/...` (جديدة)
- `src/components/CartDrawer.tsx` (تعديل: نموذج العنوان بدل Stripe)
- `src/pages/AdminDashboard.tsx` (تعديل: تبويب الطلبات)
- `src/components/admin/OrdersSection.tsx` (جديد)
- `src/pages/PaymentSuccess.tsx` (تعديل النص)
- حذف `supabase/functions/create-checkout/` (اختياري — أوقفها فقط)
