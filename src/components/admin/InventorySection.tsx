import { useEffect, useState } from "react";
import { Boxes, Save, AlertTriangle, Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from "@/lib/csv";

const InventorySection = () => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, { quantity: number; low: number }>>({});

  const fetchAll = async () => {
    const [b, f, inv] = await Promise.all([
      supabase.from("branches").select("*").eq("is_active", true).order("name_ar"),
      supabase.from("fabrics_db").select("id, name, name_en"),
      supabase.from("branch_inventory").select("*"),
    ]);
    setBranches(b.data || []);
    setFabrics(f.data || []);
    setInventory(inv.data || []);
    if (!branchId && b.data?.length) setBranchId(b.data[0].id);
  };
  useEffect(() => { fetchAll(); }, []);

  const invFor = (fabricId: string) => inventory.find((i) => i.branch_id === branchId && i.fabric_id === fabricId);
  const filtered = fabrics.filter((f) => !search || f.name?.includes(search) || f.name_en?.toLowerCase().includes(search.toLowerCase()));

  const getVal = (fabricId: string) => {
    if (edits[fabricId]) return edits[fabricId];
    const row = invFor(fabricId);
    return { quantity: row?.quantity ?? 0, low: row?.low_stock_threshold ?? 5 };
  };
  const setVal = (fabricId: string, patch: Partial<{ quantity: number; low: number }>) =>
    setEdits({ ...edits, [fabricId]: { ...getVal(fabricId), ...patch } });

  const saveRow = async (fabricId: string) => {
    const v = getVal(fabricId);
    const { error } = await supabase.from("branch_inventory").upsert(
      { branch_id: branchId, fabric_id: fabricId, quantity: v.quantity, low_stock_threshold: v.low },
      { onConflict: "branch_id,fabric_id" },
    );
    if (error) { toast({ title: "حدث خطأ", variant: "destructive" }); return; }
    toast({ title: "تم الحفظ" });
    const next = { ...edits }; delete next[fabricId]; setEdits(next);
    fetchAll();
  };

  const lowStock = inventory.filter((i) => i.branch_id === branchId && i.quantity <= i.low_stock_threshold);

  const exportInv = () => {
    const rows = filtered.map((f) => { const v = getVal(f.id); return { fabric: f.name, quantity: v.quantity, low_threshold: v.low }; });
    exportToCsv(`inventory_${branchId.slice(0, 6)}`, rows);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground"><Boxes size={18} className="text-primary" /> مخزون الفروع</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label className="font-body text-sm">الفرع</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar || b.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="font-body text-sm">بحث عن قماش</Label>
            <div className="relative">
              <Search size={16} className="absolute right-3 top-3 text-muted-foreground" />
              <Input className="pr-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="اسم القماش" />
            </div>
          </div>
        </div>
        {lowStock.length > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
            <AlertTriangle size={16} /> {lowStock.length} صنف منخفض المخزون في هذا الفرع
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button onClick={exportInv} variant="outline" size="sm" className="gap-1 font-body"><Download size={14} /> تصدير المخزون</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <div className="space-y-2">
          {filtered.map((f) => {
            const v = getVal(f.id);
            const isLow = v.quantity <= v.low;
            return (
              <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2">
                <span className="font-body text-sm text-foreground flex-1 min-w-[140px]">{f.name}</span>
                <div className="flex items-center gap-1">
                  <Label className="font-body text-xs text-muted-foreground">الكمية</Label>
                  <Input type="number" className="w-20 h-8" value={v.quantity} onChange={(e) => setVal(f.id, { quantity: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="font-body text-xs text-muted-foreground">حد التنبيه</Label>
                  <Input type="number" className="w-16 h-8" value={v.low} onChange={(e) => setVal(f.id, { low: Number(e.target.value) })} />
                </div>
                {isLow && <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-body text-xs text-destructive">منخفض</span>}
                <Button size="sm" onClick={() => saveRow(f.id)} className="gap-1 font-body"><Save size={14} /> حفظ</Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventorySection;