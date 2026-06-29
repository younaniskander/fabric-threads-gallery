import { useEffect, useState } from "react";
import { Bell, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const NotificationsSection = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", body: "", type: "info", target: "all", segment: "" });
  const [recent, setRecent] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    const [p, s, o, n] = await Promise.all([
      supabase.from("profiles").select("id, full_name, loyalty_points"),
      supabase.from("customer_segments").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("orders").select("user_id, total_amount, status"),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setProfiles(p.data || []);
    setSegments(s.data || []);
    setOrders(o.data || []);
    setRecent(n.data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const validOrders = orders.filter((o) => !["cancelled", "returned", "refunded", "rejected"].includes(o.status));
  const targetUsers = () => {
    if (form.target === "all") return profiles.map((p) => p.id);
    const seg = segments.find((s) => s.key === form.segment);
    if (!seg) return [];
    return profiles.filter((p) => {
      let m = 0;
      if (seg.rule_type === "points") m = p.loyalty_points || 0;
      else if (seg.rule_type === "spend") m = validOrders.filter((o) => o.user_id === p.id).reduce((a, o) => a + Number(o.total_amount || 0), 0);
      else if (seg.rule_type === "orders") m = validOrders.filter((o) => o.user_id === p.id).length;
      return m >= seg.min_value && (seg.max_value == null || m <= seg.max_value);
    }).map((p) => p.id);
  };

  const send = async () => {
    if (!form.title.trim()) { toast({ title: "أدخل عنوان الإشعار", variant: "destructive" }); return; }
    const ids = targetUsers();
    if (!ids.length) { toast({ title: "لا يوجد مستلمون", variant: "destructive" }); return; }
    setSending(true);
    const rows = ids.map((user_id) => ({ user_id, title: form.title.trim(), body: form.body.trim(), type: form.type }));
    const { error } = await supabase.from("notifications").insert(rows);
    setSending(false);
    if (error) { toast({ title: "حدث خطأ", variant: "destructive" }); return; }
    toast({ title: `تم إرسال الإشعار إلى ${ids.length} عميل` });
    setForm({ ...form, title: "", body: "" });
    fetchAll();
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground"><Bell size={18} className="text-primary" /> إرسال إشعار</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-body text-sm">العنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عرض خاص لك!" />
          </div>
          <div>
            <Label className="font-body text-sm">النص</Label>
            <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label className="font-body text-sm">النوع</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="info">معلومة</option>
                <option value="promo">عرض</option>
                <option value="order">طلب</option>
                <option value="loyalty">ولاء</option>
              </select>
            </div>
            <div>
              <Label className="font-body text-sm">المستهدف</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                <option value="all">جميع العملاء</option>
                <option value="segment">شريحة محددة</option>
              </select>
            </div>
            {form.target === "segment" && (
              <div>
                <Label className="font-body text-sm">الشريحة</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                  <option value="">اختر شريحة</option>
                  {segments.map((s) => <option key={s.id} value={s.key}>{s.name_ar || s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
            <Users size={14} /> سيصل إلى {targetUsers().length} عميل
          </div>
          <Button onClick={send} disabled={sending} className="gap-2 font-body"><Send size={16} /> إرسال الإشعار</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 font-display text-lg text-foreground">آخر الإشعارات</h3>
        {recent.length === 0 ? (
          <p className="py-6 text-center font-body text-sm text-muted-foreground">لا توجد إشعارات بعد.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-body text-foreground">{n.title}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">{n.type}</span>
                <span className="ms-auto font-body text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("ar-EG")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;