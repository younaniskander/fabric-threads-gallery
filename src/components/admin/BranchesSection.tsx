import { useEffect, useState } from "react";
import { Building2, Plus, Trash2, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Branch = { id: string; name: string; name_ar: string; code: string | null; city: string; phone: string; address: string; is_active: boolean };
const empty = { name: "", name_ar: "", code: "", city: "", phone: "", address: "" };

const BranchesSection = () => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({ ...empty });

  const load = async () => {
    const { data } = await supabase.from("branches").select("*").order("created_at");
    setBranches((data as Branch[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name_ar.trim() && !form.name.trim()) { toast({ title: "أدخل اسم الفرع", variant: "destructive" }); return; }
    const { error } = await supabase.from("branches").insert({
      name: form.name.trim() || form.name_ar.trim(),
      name_ar: form.name_ar.trim() || form.name.trim(),
      code: form.code.trim() || null, city: form.city.trim(), phone: form.phone.trim(), address: form.address.trim(),
    });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تمت إضافة الفرع" }); setForm({ ...empty }); load();
  };
  const toggle = async (b: Branch) => { await supabase.from("branches").update({ is_active: !b.is_active }).eq("id", b.id); load(); };
  const del = async (id: string) => { await supabase.from("branches").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="flex items-center gap-2 font-display text-xl text-foreground"><Building2 size={20} className="text-primary" /> إدارة الفروع</h2>
      <div className="rounded-xl bg-card p-5 shadow-fabric">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div><Label className="font-body text-sm">الاسم بالعربي</Label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="font-body" /></div>
          <div><Label className="font-body text-sm">الاسم بالإنجليزي</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" /></div>
          <div><Label className="font-body text-sm">الكود</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} dir="ltr" /></div>
          <div><Label className="font-body text-sm">المدينة</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="font-body" /></div>
          <div><Label className="font-body text-sm">الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
          <div><Label className="font-body text-sm">العنوان</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="font-body" /></div>
        </div>
        <Button onClick={add} className="mt-4 gap-2 font-body"><Plus size={16} /> إضافة فرع</Button>
      </div>
      <div className="space-y-2">
        {branches.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-fabric">
            <span className="font-display text-foreground">{b.name_ar || b.name}</span>
            {b.code && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">{b.code}</span>}
            {b.city && <span className="font-body text-xs text-muted-foreground">{b.city}</span>}
            <span className={`font-body text-xs ${b.is_active ? "text-green-600" : "text-muted-foreground"}`}>{b.is_active ? "نشط" : "موقوف"}</span>
            <div className="ms-auto flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => toggle(b)} className="gap-1 font-body text-xs"><Power size={14} /> {b.is_active ? "إيقاف" : "تفعيل"}</Button>
              <Button size="sm" variant="ghost" onClick={() => del(b.id)} className="text-destructive"><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchesSection;
