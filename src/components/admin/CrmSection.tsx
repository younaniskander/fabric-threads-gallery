import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Save, Download, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from "@/lib/csv";

type Segment = {
  id: string;
  key: string;
  name: string;
  name_ar: string;
  description: string;
  rule_type: string;
  min_value: number;
  max_value: number | null;
  color: string;
  is_active: boolean;
};

const ruleLabels: Record<string, string> = { points: "نقاط الولاء", spend: "إجمالي الإنفاق", orders: "عدد الطلبات" };

const CrmSection = () => {
  const { toast } = useToast();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeSeg, setActiveSeg] = useState<string>("");

  const fetchAll = async () => {
    const [s, p, o] = await Promise.all([
      supabase.from("customer_segments").select("*").order("sort_order"),
      supabase.from("profiles").select("id, full_name, phone, loyalty_points, membership_level"),
      supabase.from("orders").select("user_id, total_amount, status"),
    ]);
    setSegments((s.data as Segment[]) || []);
    setProfiles(p.data || []);
    setOrders(o.data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const validOrders = orders.filter((o) => !["cancelled", "returned", "refunded", "rejected"].includes(o.status));
  const metricFor = (seg: Segment, userId: string) => {
    if (seg.rule_type === "points") return profiles.find((p) => p.id === userId)?.loyalty_points || 0;
    if (seg.rule_type === "spend") return validOrders.filter((o) => o.user_id === userId).reduce((a, o) => a + Number(o.total_amount || 0), 0);
    if (seg.rule_type === "orders") return validOrders.filter((o) => o.user_id === userId).length;
    return 0;
  };
  const membersOf = (seg: Segment) =>
    profiles.filter((p) => {
      const m = metricFor(seg, p.id);
      return m >= seg.min_value && (seg.max_value == null || m <= seg.max_value);
    });

  const addSegment = async () => {
    const key = `seg_${Date.now()}`;
    await supabase.from("customer_segments").insert({ key, name: "شريحة جديدة", name_ar: "شريحة جديدة", rule_type: "points", min_value: 0 });
    fetchAll();
  };
  const saveSegment = async (s: Segment) => {
    const { error } = await supabase.from("customer_segments").update({
      name_ar: s.name_ar, name: s.name, description: s.description, rule_type: s.rule_type,
      min_value: Number(s.min_value) || 0, max_value: s.max_value === null ? null : Number(s.max_value),
      color: s.color, is_active: s.is_active,
    }).eq("id", s.id);
    if (error) { toast({ title: "حدث خطأ", variant: "destructive" }); return; }
    toast({ title: "تم حفظ الشريحة" });
    fetchAll();
  };
  const deleteSegment = async (id: string) => { await supabase.from("customer_segments").delete().eq("id", id); fetchAll(); };

  const exportSegment = (seg: Segment) => {
    const rows = membersOf(seg).map((p) => ({
      name: p.full_name, phone: p.phone, points: p.loyalty_points, level: p.membership_level, metric: metricFor(seg, p.id),
    }));
    if (!rows.length) { toast({ title: "لا يوجد عملاء في هذه الشريحة" }); return; }
    exportToCsv(`segment_${seg.key}`, rows);
  };

  const shown = segments.find((s) => s.id === activeSeg);

  return (
    <div className="space-y-8" dir="rtl">
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg text-foreground"><Users size={18} className="text-primary" /> شرائح العملاء</h3>
          <Button onClick={addSegment} size="sm" variant="outline" className="gap-1 font-body"><Plus size={14} /> شريحة جديدة</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {segments.map((s, i) => (
            <div key={s.id} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: s.color }} />
                <Input className="max-w-[160px]" value={s.name_ar} onChange={(e) => setSegments(segments.map((x, j) => j === i ? { ...x, name_ar: e.target.value } : x))} />
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">{membersOf(s).length} عميل</span>
                <div className="ms-auto"><Switch checked={s.is_active} onCheckedChange={(v) => setSegments(segments.map((x, j) => j === i ? { ...x, is_active: v } : x))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="font-body text-xs">المعيار</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={s.rule_type} onChange={(e) => setSegments(segments.map((x, j) => j === i ? { ...x, rule_type: e.target.value } : x))}>
                    <option value="points">نقاط</option>
                    <option value="spend">إنفاق</option>
                    <option value="orders">طلبات</option>
                  </select>
                </div>
                <div>
                  <Label className="font-body text-xs">من</Label>
                  <Input type="number" value={s.min_value} onChange={(e) => setSegments(segments.map((x, j) => j === i ? { ...x, min_value: Number(e.target.value) } : x))} />
                </div>
                <div>
                  <Label className="font-body text-xs">إلى (اختياري)</Label>
                  <Input type="number" value={s.max_value ?? ""} onChange={(e) => setSegments(segments.map((x, j) => j === i ? { ...x, max_value: e.target.value === "" ? null : Number(e.target.value) } : x))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => saveSegment(s)} className="gap-1 font-body"><Save size={14} /> حفظ</Button>
                <Button size="sm" variant="outline" onClick={() => setActiveSeg(s.id)} className="gap-1 font-body"><Users size={14} /> العملاء</Button>
                <Button size="sm" variant="outline" onClick={() => exportSegment(s)} className="gap-1 font-body"><Download size={14} /> تصدير</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteSegment(s.id)} className="ms-auto text-destructive"><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {shown && (
        <div className="bg-card rounded-xl p-5 shadow-fabric">
          <h3 className="mb-4 font-display text-lg text-foreground">عملاء شريحة: {shown.name_ar} ({membersOf(shown).length})</h3>
          <div className="space-y-2">
            {membersOf(shown).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-body text-foreground">{p.full_name || "—"}</span>
                <span className="font-body text-xs text-muted-foreground">{p.phone || "—"}</span>
                <span className="ms-auto font-body text-xs text-primary">{ruleLabels[shown.rule_type]}: {metricFor(shown, p.id)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmSection;