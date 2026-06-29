import { useEffect, useState } from "react";
import { Puzzle, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Mod = { key: string; name_ar: string; description: string; enabled: boolean; sort_order: number };

const ModulesSection = () => {
  const { toast } = useToast();
  const [mods, setMods] = useState<Mod[]>([]);

  const load = async () => {
    const { data } = await supabase.from("app_modules").select("*").order("sort_order");
    setMods((data as Mod[]) || []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (m: Mod, v: boolean) => {
    setMods((s) => s.map((x) => (x.key === m.key ? { ...x, enabled: v } : x)));
    const { error } = await supabase.from("app_modules").update({ enabled: v }).eq("key", m.key);
    if (error) { toast({ title: "خطأ", variant: "destructive" }); load(); }
    else toast({ title: v ? `تم تفعيل ${m.name_ar}` : `تم إيقاف ${m.name_ar}` });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2">
        <Puzzle size={20} className="text-primary" />
        <h2 className="font-display text-xl text-foreground">وحدات النظام (Modules)</h2>
      </div>
      <p className="font-body text-sm text-muted-foreground">فعّل أو أوقف أي وحدة دون تعديل الكود — نظام Plugin-based.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {mods.map((m) => (
          <div key={m.key} className="flex items-center justify-between rounded-xl bg-card p-4 shadow-fabric">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-body font-semibold text-foreground">
                <Power size={15} className={m.enabled ? "text-green-600" : "text-muted-foreground"} />
                {m.name_ar}
              </p>
              <p className="truncate font-body text-xs text-muted-foreground">{m.description}</p>
            </div>
            <Switch checked={m.enabled} onCheckedChange={(v) => toggle(m, v)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesSection;
