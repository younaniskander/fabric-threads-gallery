import { useEffect, useState } from "react";
import { Gift, Search, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  loyalty_points: number;
}

const LoyaltySection = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pointsInput, setPointsInput] = useState<Record<string, string>>({});
  const [reasonInput, setReasonInput] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, loyalty_points")
      .order("loyalty_points", { ascending: false });
    setProfiles((data as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const adjust = async (p: Profile, sign: 1 | -1) => {
    const raw = parseInt(pointsInput[p.id] || "0", 10);
    if (!raw || raw <= 0) {
      toast({ title: "خطأ", description: "أدخل عدد نقاط صحيح", variant: "destructive" });
      return;
    }
    const points = sign * raw;
    const { error } = await supabase.from("loyalty_transactions").insert({
      user_id: p.id,
      points,
      type: sign > 0 ? "earn" : "redeem",
      reason: reasonInput[p.id]?.trim() || (sign > 0 ? "إضافة من الإدارة" : "استبدال نقاط"),
    });
    if (error) {
      toast({ title: "خطأ", description: "تعذّر تعديل النقاط", variant: "destructive" });
      return;
    }
    toast({ title: "تم", description: sign > 0 ? "تمت إضافة النقاط" : "تم خصم النقاط" });
    setPointsInput((s) => ({ ...s, [p.id]: "" }));
    setReasonInput((s) => ({ ...s, [p.id]: "" }));
    load();
  };

  const filtered = profiles.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (p.full_name || "").toLowerCase().includes(q) || (p.phone || "").includes(q);
  });

  const totalPoints = profiles.reduce((s, p) => s + (p.loyalty_points || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl text-foreground flex items-center gap-2">
          <Gift size={20} className="text-primary" /> نظام نقاط الولاء
        </h2>
        <span className="font-body text-sm text-muted-foreground">إجمالي النقاط الممنوحة: {totalPoints}</span>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو الهاتف"
          className="pr-9 font-body"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 font-body text-muted-foreground">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl p-10 text-center font-body text-muted-foreground">لا يوجد عملاء</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card rounded-xl shadow-fabric p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-display text-primary">
                  {p.loyalty_points}
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground">{p.full_name || "—"}</p>
                  <p className="font-body text-xs text-muted-foreground" dir="ltr">{p.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="number"
                  value={pointsInput[p.id] || ""}
                  onChange={(e) => setPointsInput((s) => ({ ...s, [p.id]: e.target.value }))}
                  placeholder="النقاط"
                  className="w-24 font-body"
                  dir="ltr"
                />
                <Input
                  value={reasonInput[p.id] || ""}
                  onChange={(e) => setReasonInput((s) => ({ ...s, [p.id]: e.target.value }))}
                  placeholder="السبب (اختياري)"
                  className="w-40 font-body"
                />
                <Button size="sm" onClick={() => adjust(p, 1)} className="gap-1 gradient-teal text-primary-foreground font-body">
                  <Plus size={14} /> إضافة
                </Button>
                <Button size="sm" variant="outline" onClick={() => adjust(p, -1)} className="gap-1 font-body text-destructive">
                  <Minus size={14} /> خصم
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoyaltySection;
