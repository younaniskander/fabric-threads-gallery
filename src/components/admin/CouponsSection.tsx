import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Truck, Tag, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
};

const emptyForm = {
  code: "",
  discount_type: "percent",
  discount_value: "",
  min_order: "",
  usage_limit: "",
  expires_at: "",
};

const CouponsSection = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [shipping, setShipping] = useState({
    id: "",
    free_shipping_enabled: true,
    free_shipping_threshold: "2000",
    shipping_fee: "0",
  });

  const fetchAll = async () => {
    const [c, s] = await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("shipping_settings").select("*").limit(1).maybeSingle(),
    ]);
    setCoupons((c.data as Coupon[]) || []);
    if (s.data)
      setShipping({
        id: s.data.id,
        free_shipping_enabled: s.data.free_shipping_enabled,
        free_shipping_threshold: String(s.data.free_shipping_threshold),
        shipping_fee: String(s.data.shipping_fee),
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addCoupon = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code || !form.discount_value) {
      toast({ title: "أدخل الكود وقيمة الخصم", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order) || 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: error.message.includes("duplicate") ? "الكود موجود بالفعل" : "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تمت إضافة الكود" });
    setForm({ ...emptyForm });
    fetchAll();
  };

  const toggleCoupon = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    fetchAll();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    fetchAll();
  };

  const saveShipping = async () => {
    const payload = {
      free_shipping_enabled: shipping.free_shipping_enabled,
      free_shipping_threshold: Number(shipping.free_shipping_threshold) || 0,
      shipping_fee: Number(shipping.shipping_fee) || 0,
    };
    const { error } = shipping.id
      ? await supabase.from("shipping_settings").update(payload).eq("id", shipping.id)
      : await supabase.from("shipping_settings").insert(payload);
    if (error) {
      toast({ title: "حدث خطأ في حفظ الشحن", variant: "destructive" });
      return;
    }
    toast({ title: "تم حفظ إعدادات الشحن" });
    fetchAll();
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Shipping settings */}
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground">
          <Truck size={18} className="text-primary" /> إعدادات الشحن
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <Label className="font-body text-sm">تفعيل الشحن المجاني</Label>
            <Switch
              checked={shipping.free_shipping_enabled}
              onCheckedChange={(v) => setShipping({ ...shipping, free_shipping_enabled: v })}
            />
          </div>
          <div>
            <Label className="font-body text-sm">حد الشحن المجاني (ج.م)</Label>
            <Input
              type="number"
              value={shipping.free_shipping_threshold}
              onChange={(e) => setShipping({ ...shipping, free_shipping_threshold: e.target.value })}
            />
          </div>
          <div>
            <Label className="font-body text-sm">رسوم الشحن (ج.م)</Label>
            <Input
              type="number"
              value={shipping.shipping_fee}
              onChange={(e) => setShipping({ ...shipping, shipping_fee: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={saveShipping} className="mt-4 gap-2 font-body">
          <Save size={16} /> حفظ إعدادات الشحن
        </Button>
      </div>

      {/* Add coupon */}
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground">
          <Tag size={18} className="text-primary" /> إضافة كود خصم
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label className="font-body text-sm">الكود</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER25" />
          </div>
          <div>
            <Label className="font-body text-sm">نوع الخصم</Label>
            <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">نسبة مئوية %</SelectItem>
                <SelectItem value="fixed">مبلغ ثابت ج.م</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body text-sm">قيمة الخصم</Label>
            <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-sm">الحد الأدنى للطلب (ج.م)</Label>
            <Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-sm">حد الاستخدام (اختياري)</Label>
            <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-sm">تاريخ الانتهاء (اختياري)</Label>
            <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          </div>
        </div>
        <Button onClick={addCoupon} disabled={saving} className="mt-4 gap-2 font-body">
          <Plus size={16} /> إضافة الكود
        </Button>
      </div>

      {/* Coupons list */}
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 font-display text-lg text-foreground">أكواد الخصم ({coupons.length})</h3>
        {coupons.length === 0 ? (
          <p className="py-6 text-center font-body text-sm text-muted-foreground">لا توجد أكواد بعد.</p>
        ) : (
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <span className="font-display text-base text-foreground">{c.code}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">
                  {c.discount_type === "percent" ? `${c.discount_value}%` : `${c.discount_value} ج.م`}
                </span>
                {c.min_order > 0 && (
                  <span className="font-body text-xs text-muted-foreground">حد أدنى: {c.min_order} ج.م</span>
                )}
                {c.usage_limit != null && (
                  <span className="font-body text-xs text-muted-foreground">
                    الاستخدام: {c.used_count}/{c.usage_limit}
                  </span>
                )}
                {c.expires_at && (
                  <span className="font-body text-xs text-muted-foreground">
                    ينتهي: {new Date(c.expires_at).toLocaleDateString("ar-EG")}
                  </span>
                )}
                <span className={`font-body text-xs ${c.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                  {c.is_active ? "مفعّل" : "موقوف"}
                </span>
                <div className="ms-auto flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleCoupon(c)} className="gap-1 font-body text-xs">
                    <Power size={14} /> {c.is_active ? "إيقاف" : "تفعيل"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCoupon(c.id)} className="text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsSection;