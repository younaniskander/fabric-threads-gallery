import { useEffect, useState } from "react";
import { Settings2, Save, Crown, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Rules = {
  id: string; points_per_currency: number; point_value: number; min_redeem_points: number;
  award_on_status: string; points_expiry_days: number; enabled: boolean;
};
type Level = { id: string; key: string; name_ar: string; min_points: number; discount_percent: number; color: string; sort_order: number };

const STATUSES = ["pending", "processing", "shipped", "delivered", "completed"];

const LoyaltyRulesSection = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rules | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [newLevel, setNewLevel] = useState({ key: "", name_ar: "", min_points: "", discount_percent: "", color: "#cccccc" });

  const load = async () => {
    const [r, l] = await Promise.all([
      supabase.from("loyalty_rules").select("*").limit(1).maybeSingle(),
      supabase.from("membership_levels").select("*").order("sort_order"),
    ]);
    setRules(r.data as Rules);
    setLevels((l.data as Level[]) || []);
  };
  useEffect(() => { load(); }, []);

  const saveRules = async () => {
    if (!rules) return;
    const { error } = await supabase.from("loyalty_rules").update({
      points_per_currency: rules.points_per_currency, point_value: rules.point_value,
      min_redeem_points: rules.min_redeem_points, award_on_status: rules.award_on_status,
      points_expiry_days: rules.points_expiry_days, enabled: rules.enabled,
    }).eq("id", rules.id);
    if (error) { toast({ title: "خطأ", variant: "destructive" }); return; }
    toast({ title: "تم حفظ قواعد الولاء" });
  };

  const addLevel = async () => {
    if (!newLevel.key.trim() || !newLevel.name_ar.trim()) { toast({ title: "أدخل المفتاح والاسم", variant: "destructive" }); return; }
    const { error } = await supabase.from("membership_levels").insert({
      key: newLevel.key.trim().toLowerCase(), name_ar: newLevel.name_ar.trim(), name: newLevel.name_ar.trim(),
      min_points: Number(newLevel.min_points) || 0, discount_percent: Number(newLevel.discount_percent) || 0,
      color: newLevel.color, sort_order: levels.length + 1,
    });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    setNewLevel({ key: "", name_ar: "", min_points: "", discount_percent: "", color: "#cccccc" }); load();
  };
  const delLevel = async (id: string) => { await supabase.from("membership_levels").delete().eq("id", id); load(); };
  const updLevel = async (lv: Level) => {
    await supabase.from("membership_levels").update({ min_points: lv.min_points, discount_percent: lv.discount_percent }).eq("id", lv.id);
    toast({ title: "تم تحديث المستوى" });
  };

  if (!rules) return <div className="py-10 text-center font-body text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-xl bg-card p-5 shadow-fabric">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground"><Settings2 size={18} className="text-primary" /> قواعد الولاء</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><Label className="font-body text-sm">نقاط لكل 1 ج.م</Label><Input type="number" value={rules.points_per_currency} onChange={(e) => setRules({ ...rules, points_per_currency: Number(e.target.value) })} dir="ltr" /></div>
          <div><Label className="font-body text-sm">قيمة النقطة (ج.م)</Label><Input type="number" step="0.01" value={rules.point_value} onChange={(e) => setRules({ ...rules, point_value: Number(e.target.value) })} dir="ltr" /></div>
          <div><Label className="font-body text-sm">أدنى نقاط للاستبدال</Label><Input type="number" value={rules.min_redeem_points} onChange={(e) => setRules({ ...rules, min_redeem_points: Number(e.target.value) })} dir="ltr" /></div>
          <div>
            <Label className="font-body text-sm">إضافة النقاط عند حالة الطلب</Label>
            <Select value={rules.award_on_status} onValueChange={(v) => setRules({ ...rules, award_on_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="font-body text-sm">انتهاء النقاط بعد (يوم، 0=بلا)</Label><Input type="number" value={rules.points_expiry_days} onChange={(e) => setRules({ ...rules, points_expiry_days: Number(e.target.value) })} dir="ltr" /></div>
          <label className="flex items-center gap-2 self-end font-body text-sm">تفعيل نظام الولاء <Switch checked={rules.enabled} onCheckedChange={(v) => setRules({ ...rules, enabled: v })} /></label>
        </div>
        <Button onClick={saveRules} className="mt-4 gap-2 font-body"><Save size={16} /> حفظ القواعد</Button>
        <p className="mt-3 font-body text-xs text-muted-foreground">النقاط تُضاف فقط عند وصول الطلب لحالة «{rules.award_on_status}»، وتُسحب تلقائياً عند الإلغاء/الإرجاع/الاسترجاع.</p>
      </div>

      <div className="rounded-xl bg-card p-5 shadow-fabric">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground"><Crown size={18} className="text-primary" /> مستويات العضوية</h2>
        <div className="space-y-2">
          {levels.map((lv) => (
            <div key={lv.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
              <span className="h-4 w-4 rounded-full" style={{ background: lv.color }} />
              <span className="w-24 font-display text-foreground">{lv.name_ar}</span>
              <Label className="font-body text-xs">من نقاط</Label>
              <Input type="number" value={lv.min_points} onChange={(e) => setLevels((s) => s.map((x) => x.id === lv.id ? { ...x, min_points: Number(e.target.value) } : x))} className="h-8 w-24" dir="ltr" />
              <Label className="font-body text-xs">خصم %</Label>
              <Input type="number" value={lv.discount_percent} onChange={(e) => setLevels((s) => s.map((x) => x.id === lv.id ? { ...x, discount_percent: Number(e.target.value) } : x))} className="h-8 w-20" dir="ltr" />
              <Button size="sm" variant="outline" onClick={() => updLevel(lv)} className="font-body text-xs">حفظ</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => delLevel(lv.id)}><Trash2 size={14} /></Button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 md:grid-cols-5">
          <Input placeholder="key" value={newLevel.key} onChange={(e) => setNewLevel({ ...newLevel, key: e.target.value })} dir="ltr" />
          <Input placeholder="الاسم" value={newLevel.name_ar} onChange={(e) => setNewLevel({ ...newLevel, name_ar: e.target.value })} className="font-body" />
          <Input type="number" placeholder="أدنى نقاط" value={newLevel.min_points} onChange={(e) => setNewLevel({ ...newLevel, min_points: e.target.value })} dir="ltr" />
          <Input type="number" placeholder="خصم %" value={newLevel.discount_percent} onChange={(e) => setNewLevel({ ...newLevel, discount_percent: e.target.value })} dir="ltr" />
          <Input type="color" value={newLevel.color} onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })} className="h-10 p-1" />
        </div>
        <Button onClick={addLevel} className="mt-3 gap-2 font-body"><Plus size={16} /> إضافة مستوى</Button>
      </div>
    </div>
  );
};

export default LoyaltyRulesSection;
