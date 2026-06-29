import { useEffect, useState } from "react";
import { MessageCircle, Save, Send, Plus, Trash2, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { renderTemplate, buildWaLinkTo, TEMPLATE_VARS } from "@/lib/waTemplates";

type Template = {
  id: string;
  key: string;
  name: string;
  name_ar: string;
  trigger_event: string;
  body_ar: string;
  body_en: string;
  enabled: boolean;
};

const WhatsappSection = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [send, setSend] = useState({ phone: "", templateKey: "", name: "" });

  const fetchAll = async () => {
    const [t, l] = await Promise.all([
      supabase.from("whatsapp_templates").select("*").order("created_at"),
      supabase.from("whatsapp_logs").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setTemplates((t.data as Template[]) || []);
    setLogs(l.data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const saveTemplate = async (tpl: Template) => {
    const { error } = await supabase.from("whatsapp_templates").update({
      name: tpl.name, name_ar: tpl.name_ar, trigger_event: tpl.trigger_event,
      body_ar: tpl.body_ar, body_en: tpl.body_en, enabled: tpl.enabled,
    }).eq("id", tpl.id);
    if (error) { toast({ title: "حدث خطأ", variant: "destructive" }); return; }
    toast({ title: "تم حفظ القالب" });
    fetchAll();
  };

  const addTemplate = async () => {
    const key = `custom_${Date.now()}`;
    const { error } = await supabase.from("whatsapp_templates").insert({
      key, name: "قالب جديد", name_ar: "قالب جديد", trigger_event: "manual",
      body_ar: "مرحباً {{name}}", body_en: "Hello {{name}}",
    });
    if (error) { toast({ title: "حدث خطأ", variant: "destructive" }); return; }
    fetchAll();
  };

  const deleteTemplate = async (id: string) => {
    await supabase.from("whatsapp_templates").delete().eq("id", id);
    fetchAll();
  };

  const sendManual = async () => {
    const tpl = templates.find((t) => t.key === send.templateKey);
    if (!send.phone || !tpl) { toast({ title: "اختر القالب وأدخل الرقم", variant: "destructive" }); return; }
    const msg = renderTemplate(tpl.body_ar, { name: send.name || "عميلنا العزيز" });
    await supabase.from("whatsapp_logs").insert({ phone: send.phone, template_key: tpl.key, message: msg, status: "sent" });
    window.open(buildWaLinkTo(send.phone, msg), "_blank");
    fetchAll();
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground">
          <Send size={18} className="text-primary" /> إرسال رسالة سريعة
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label className="font-body text-sm">رقم العميل (دولي)</Label>
            <Input value={send.phone} onChange={(e) => setSend({ ...send, phone: e.target.value })} placeholder="201xxxxxxxxx" />
          </div>
          <div>
            <Label className="font-body text-sm">اسم العميل</Label>
            <Input value={send.name} onChange={(e) => setSend({ ...send, name: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-sm">القالب</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={send.templateKey} onChange={(e) => setSend({ ...send, templateKey: e.target.value })}>
              <option value="">اختر قالباً</option>
              {templates.map((t) => <option key={t.id} value={t.key}>{t.name_ar || t.name}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={sendManual} className="mt-4 gap-2 font-body"><Send size={16} /> فتح واتساب بالرسالة</Button>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg text-foreground">
            <MessageCircle size={18} className="text-primary" /> قوالب الرسائل
          </h3>
          <Button onClick={addTemplate} size="sm" variant="outline" className="gap-1 font-body"><Plus size={14} /> قالب جديد</Button>
        </div>
        <p className="mb-4 font-body text-xs text-muted-foreground">المتغيرات المتاحة: {TEMPLATE_VARS.map((v) => `{{${v}}}`).join("، ")}</p>
        <div className="space-y-4">
          {templates.map((t, i) => (
            <div key={t.id} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Input className="max-w-[200px]" value={t.name_ar} onChange={(e) => setTemplates(templates.map((x, j) => j === i ? { ...x, name_ar: e.target.value } : x))} />
                <span className="rounded-full bg-muted px-2 py-0.5 font-body text-xs text-muted-foreground">{t.trigger_event}</span>
                <div className="ms-auto flex items-center gap-2">
                  <Switch checked={t.enabled} onCheckedChange={(v) => setTemplates(templates.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
                  <Button variant="ghost" size="sm" onClick={() => deleteTemplate(t.id)} className="text-destructive"><Trash2 size={14} /></Button>
                </div>
              </div>
              <div>
                <Label className="font-body text-xs">نص الرسالة (عربي)</Label>
                <Textarea rows={3} value={t.body_ar} onChange={(e) => setTemplates(templates.map((x, j) => j === i ? { ...x, body_ar: e.target.value } : x))} />
              </div>
              <div>
                <Label className="font-body text-xs">نص الرسالة (إنجليزي)</Label>
                <Textarea rows={2} value={t.body_en} onChange={(e) => setTemplates(templates.map((x, j) => j === i ? { ...x, body_en: e.target.value } : x))} />
              </div>
              <Button size="sm" onClick={() => saveTemplate(t)} className="gap-1 font-body"><Save size={14} /> حفظ</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 font-display text-lg text-foreground">سجل الرسائل ({logs.length})</h3>
        {logs.length === 0 ? (
          <p className="py-6 text-center font-body text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-body text-foreground">{l.phone}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">{l.template_key || "—"}</span>
                <span className="font-body text-xs text-muted-foreground truncate max-w-[280px]">{l.message}</span>
                <span className="ms-auto font-body text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("ar-EG")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsappSection;