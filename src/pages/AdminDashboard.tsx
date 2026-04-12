import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Package, MessageSquare, Tag, LogOut, BarChart3, Plus, Trash2, Eye, EyeOff,
  Star, Sparkles, Upload, Image as ImageIcon, Link as LinkIcon, Save, Send, ChevronDown, ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/adam-logo-light.png";

type Tab = "stats" | "fabrics" | "customers" | "brands" | "messages" | "social";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getPublicUrl = (bucket: string, path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

const getSignedUrl = async (bucket: string, path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
};

const getStorageUrl = async (bucket: string, path: string, isPrivate: boolean): Promise<string> => {
  if (isPrivate) {
    return (await getSignedUrl(bucket, path)) || '';
  }
  return getPublicUrl(bucket, path);
};

const AdminDashboard = () => {
  const [tab, setTab] = useState<Tab>("stats");
  const [customers, setCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin-login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) { navigate("/admin-login"); return; }
    fetchAll();
  };

  const fetchAll = async () => {
    setLoading(true);
    const [c, m, b, f, s] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("brands").select("*").order("created_at", { ascending: false }),
      supabase.from("fabrics_db").select("*").order("created_at", { ascending: false }),
      supabase.from("social_links").select("*").order("created_at", { ascending: true }),
    ]);
    setCustomers(c.data || []);
    setMessages(m.data || []);
    setBrands(b.data || []);
    setFabrics(f.data || []);
    setSocialLinks(s.data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "stats", label: "إحصائيات", icon: BarChart3 },
    { id: "fabrics", label: "الأقمشة", icon: Package, count: fabrics.length },
    { id: "customers", label: "العملاء", icon: Users, count: customers.length },
    { id: "brands", label: "الماركات", icon: Tag, count: brands.length },
    { id: "messages", label: "الرسائل", icon: MessageSquare, count: messages.filter(m => !m.is_read).length },
    { id: "social", label: "التواصل", icon: LinkIcon },
  ];
  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ADAM" className="w-10 h-10" />
          <h1 className="font-display text-xl text-foreground hidden sm:block">لوحة تحكم المشرف</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive gap-2 font-body">
          <LogOut size={16} /> خروج
        </Button>
      </header>

      <div className="bg-background border-b border-border overflow-x-auto">
        <div className="container mx-auto px-4 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 font-body text-muted-foreground">جاري التحميل...</div>
        ) : (
          <>
            {tab === "stats" && <StatsTab customers={customers} messages={messages} fabrics={fabrics} brands={brands} />}
            {tab === "fabrics" && <FabricsTab fabrics={fabrics} brands={brands} onRefresh={fetchAll} />}
            {tab === "customers" && <CustomersTab customers={customers} onRefresh={fetchAll} />}
            {tab === "brands" && <BrandsTab brands={brands} onRefresh={fetchAll} />}
            {tab === "messages" && <MessagesTab messages={messages} onRefresh={fetchAll} />}
            {tab === "social" && <SocialTab socialLinks={socialLinks} onRefresh={fetchAll} />}
          </>
        )}
      </div>
    </div>
  );
};

// Stats Tab
const StatsTab = ({ customers, messages, fabrics, brands }: any) => {
  const stats = [
    { label: "إجمالي العملاء", value: customers.length, icon: Users, color: "text-primary" },
    { label: "إجمالي الأقمشة", value: fabrics.length, icon: Package, color: "text-accent" },
    { label: "الماركات", value: brands.length, icon: Tag, color: "text-gold" },
    { label: "رسائل غير مقروءة", value: messages.filter((m: any) => !m.is_read).length, icon: MessageSquare, color: "text-destructive" },
    { label: "أقمشة مميزة", value: fabrics.filter((f: any) => f.is_featured).length, icon: Star, color: "text-accent" },
    { label: "وصل حديثاً", value: fabrics.filter((f: any) => f.is_new).length, icon: Sparkles, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-card rounded-xl p-6 shadow-fabric"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <s.icon className={`${s.color} mb-2`} size={24} />
          <div className="font-display text-3xl text-foreground">{s.value}</div>
          <div className="font-body text-sm text-muted-foreground">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Image Upload Component
const ImageUploader = ({ bucket, onUploaded, currentUrl, isPrivate = false }: { bucket: string; onUploaded: (url: string) => void; currentUrl?: string; isPrivate?: boolean }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUrl && isPrivate && currentUrl.includes('/object/public/')) {
      // Re-resolve private URLs via signed URL
      const path = currentUrl.split(`/storage/v1/object/public/${bucket}/`)[1];
      if (path) {
        getSignedUrl(bucket, path).then((signed) => { if (signed) setPreview(signed); });
      }
    }
  }, [currentUrl, isPrivate, bucket]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      setUploading(false);
      return;
    }
    const url = isPrivate ? (await getSignedUrl(bucket, path)) || '' : getPublicUrl(bucket, path);
    // Store the canonical path-based URL for the database
    const dbUrl = getPublicUrl(bucket, path);
    setPreview(url);
    onUploaded(dbUrl);
    setUploading(false);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border" />
          <button
            onClick={() => { setPreview(null); fileRef.current?.click(); }}
            className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
          >
            <Upload className="text-primary-foreground" size={20} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          {uploading ? (
            <span className="font-body text-sm">جاري الرفع...</span>
          ) : (
            <>
              <ImageIcon size={24} />
              <span className="font-body text-xs">اضغط لرفع صورة</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Fabrics Tab
const FabricsTab = ({ fabrics, brands, onRefresh }: { fabrics: any[]; brands: any[]; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", name_en: "", type: "cotton", category: "upholstery", brand: "",
    origin: "", composition: "", gsm: "", price: "اطلب السعر",
    is_featured: false, is_new: false, is_popular: false, coming_soon: false,
    image_url: "",
  });
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!form.name.trim() || !form.brand.trim()) {
      toast({ title: "خطأ", description: "يرجى ملء الاسم والماركة", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("fabrics_db").insert({
      name: form.name.trim(),
      name_en: form.name_en.trim() || null,
      type: form.type,
      category: form.category,
      brand: form.brand.trim(),
      origin: form.origin.trim() || null,
      composition: form.composition.trim() || null,
      gsm: form.gsm ? parseInt(form.gsm) : null,
      price: form.price || "اطلب السعر",
      is_featured: form.is_featured,
      is_new: form.is_new,
      is_popular: form.is_popular,
      coming_soon: form.coming_soon,
      image_url: form.image_url || null,
    });
    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة القماش", variant: "destructive" });
    } else {
      toast({ title: "تم بنجاح", description: "تم إضافة القماش" });
      setShowForm(false);
      setForm({ name: "", name_en: "", type: "cotton", category: "upholstery", brand: "", origin: "", composition: "", gsm: "", price: "اطلب السعر", is_featured: false, is_new: false, is_popular: false, coming_soon: false, image_url: "" });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("fabrics_db").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">إدارة الأقمشة</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-teal text-primary-foreground gap-2 font-body">
          <Plus size={16} /> إضافة قماش
        </Button>
      </div>

      {showForm && (
        <motion.div className="bg-card rounded-xl p-6 shadow-fabric space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">الاسم بالعربي *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">الاسم بالإنجليزي</Label><Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} dir="ltr" /></div>
            <div>
              <Label className="font-body text-sm">النوع</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["cotton","linen","polyester","silk","velvet","satin","chiffon","denim"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-sm">الفئة</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upholstery">قماش تنجيد</SelectItem>
                  <SelectItem value="curtains">مقاس ستائر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="font-body text-sm">الماركة *</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">بلد المنشأ</Label><Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">التركيب</Label><Input value={form.composition} onChange={e => setForm({...form, composition: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">GSM</Label><Input type="number" value={form.gsm} onChange={e => setForm({...form, gsm: e.target.value})} dir="ltr" /></div>
            <div><Label className="font-body text-sm">السعر</Label><Input value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="font-body" /></div>
            <div>
              <Label className="font-body text-sm">صورة المنتج</Label>
              <ImageUploader bucket="product-images" onUploaded={(url) => setForm({...form, image_url: url})} currentUrl={form.image_url || undefined} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 font-body text-sm"><Switch checked={form.is_featured} onCheckedChange={v => setForm({...form, is_featured: v})} /> مميز</label>
            <label className="flex items-center gap-2 font-body text-sm"><Switch checked={form.is_new} onCheckedChange={v => setForm({...form, is_new: v})} /> جديد</label>
            <label className="flex items-center gap-2 font-body text-sm"><Switch checked={form.is_popular} onCheckedChange={v => setForm({...form, is_popular: v})} /> شائع</label>
            <label className="flex items-center gap-2 font-body text-sm"><Switch checked={form.coming_soon} onCheckedChange={v => setForm({...form, coming_soon: v})} /> قريباً</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="gradient-teal text-primary-foreground font-body">حفظ</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">إلغاء</Button>
          </div>
        </motion.div>
      )}

      <div className="bg-card rounded-xl shadow-fabric overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right">الصورة</th>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">النوع</th>
                <th className="px-4 py-3 text-right">الفئة</th>
                <th className="px-4 py-3 text-right">الماركة</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map((f: any) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {f.image_url ? (
                      <img src={f.image_url} alt={f.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center"><ImageIcon size={16} className="text-muted-foreground" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3">{f.type}</td>
                  <td className="px-4 py-3">{f.category === "upholstery" ? "قماش تنجيد" : f.category === "curtains" ? "مقاس ستائر" : f.category}</td>
                  <td className="px-4 py-3">{f.brand}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {f.is_featured && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded">مميز</span>}
                      {f.is_new && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">جديد</span>}
                      {f.is_popular && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">شائع</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)} className="text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {fabrics.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد أقمشة بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Customers Tab
const CustomersTab = ({ customers, onRefresh }: { customers: any[]; onRefresh: () => void }) => {
  const { toast } = useToast();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleImageUpload = async (customerId: string, url: string) => {
    setUploadingId(customerId);
    const { error } = await supabase.from("customers").update({ image_url: url }).eq("id", customerId);
    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الصورة", variant: "destructive" });
    } else {
      toast({ title: "تم تحديث الصورة" });
      onRefresh();
    }
    setUploadingId(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">العملاء المسجلين ({customers.length})</h2>
      <div className="bg-card rounded-xl shadow-fabric overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right">#</th>
                <th className="px-4 py-3 text-right">الصورة</th>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">الهاتف</th>
                <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any, i: number) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="w-12">
                      <ImageUploader
                        bucket="customer-images"
                        onUploaded={(url) => handleImageUpload(c.id, url)}
                        currentUrl={c.image_url || undefined}
                        isPrivate
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 dir-ltr" dir="ltr">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد عملاء مسجلين بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Brands Tab
const BrandsTab = ({ brands, onRefresh }: { brands: any[]; onRefresh: () => void }) => {
  const [newBrand, setNewBrand] = useState("");
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newBrand.trim()) return;
    const { error } = await supabase.from("brands").insert({ name: newBrand.trim() });
    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة الماركة", variant: "destructive" });
    } else {
      setNewBrand("");
      toast({ title: "تم إضافة الماركة" });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("brands").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">إدارة الماركات</h2>
      <div className="flex gap-2">
        <Input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="اسم الماركة الجديدة" className="font-body max-w-xs" />
        <Button onClick={handleAdd} className="gradient-teal text-primary-foreground gap-2 font-body"><Plus size={16} /> إضافة</Button>
      </div>
      <div className="bg-card rounded-xl shadow-fabric overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">التاريخ</th>
              <th className="px-4 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b: any) => (
              <tr key={b.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-4 py-3 font-semibold">{b.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(b.created_at).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="text-destructive"><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Messages Tab
const MessagesTab = ({ messages, onRefresh }: { messages: any[]; onRefresh: () => void }) => {
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("messages").update({ is_read: !current }).eq("id", id);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    toast({ title: "تم حذف الرسالة" });
    onRefresh();
  };

  const loadReplies = async (messageId: string) => {
    const { data } = await supabase
      .from("message_replies")
      .select("*")
      .eq("message_id", messageId)
      .order("created_at", { ascending: true });
    if (data) setReplies((prev) => ({ ...prev, [messageId]: data }));
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("message_replies").insert({
      message_id: messageId,
      reply_text: replyText.trim(),
      replied_by: user?.id || null,
    });
    setSendingReply(false);
    if (error) {
      toast({ title: "خطأ", description: "فشل في إرسال الرد", variant: "destructive" });
    } else {
      toast({ title: "تم إرسال الرد" });
      setReplyText("");
      setReplyingTo(null);
      loadReplies(messageId);
      // Mark as read
      await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
      onRefresh();
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedMsg === id) {
      setExpandedMsg(null);
    } else {
      setExpandedMsg(id);
      loadReplies(id);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">الرسائل ({messages.length})</h2>
      <div className="space-y-3">
        {messages.map((m: any) => (
          <motion.div
            key={m.id}
            className={`bg-card rounded-xl p-4 shadow-fabric border-r-4 ${m.is_read ? "border-border" : "border-primary"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body font-semibold text-foreground">{m.name}</span>
                  {m.phone && <span className="text-xs text-muted-foreground" dir="ltr">{m.phone}</span>}
                  {!m.is_read && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">جديد</span>}
                </div>
                <p className="font-body text-sm text-muted-foreground">{m.message}</p>
                <span className="font-body text-xs text-muted-foreground/60 mt-1 block">
                  {new Date(m.created_at).toLocaleDateString("ar-EG")} - {new Date(m.created_at).toLocaleTimeString("ar-EG")}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => toggleExpand(m.id)}>
                  {expandedMsg === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleRead(m.id, m.is_read)}>
                  {m.is_read ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(replyingTo === m.id ? null : m.id); setReplyText(""); }}>
                  <Send size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {/* Replies */}
            {expandedMsg === m.id && replies[m.id] && replies[m.id].length > 0 && (
              <div className="mt-3 ms-4 border-s-2 border-primary/30 ps-3 space-y-2">
                {replies[m.id].map((r: any) => (
                  <div key={r.id} className="bg-muted rounded-lg p-3">
                    <p className="font-body text-sm text-foreground">{r.reply_text}</p>
                    <span className="font-body text-xs text-muted-foreground mt-1 block">
                      رد الإدارة - {new Date(r.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === m.id && (
              <div className="mt-3 flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب الرد..."
                  className="flex-1 font-body text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") handleReply(m.id); }}
                />
                <Button size="sm" onClick={() => handleReply(m.id)} disabled={sendingReply} className="gap-1 font-body">
                  <Send size={14} /> رد
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-body">لا توجد رسائل</div>
        )}
      </div>
    </div>
  );
};

// Social Links Tab
const platformLabels: Record<string, string> = {
  facebook: "فيسبوك", tiktok: "تيك توك", instagram: "انستجرام",
  twitter: "تويتر", youtube: "يوتيوب", snapchat: "سناب شات", whatsapp: "واتساب",
};

const SocialTab = ({ socialLinks, onRefresh }: { socialLinks: any[]; onRefresh: () => void }) => {
  const [links, setLinks] = useState<any[]>(socialLinks);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => { setLinks(socialLinks); }, [socialLinks]);

  const handleUpdate = async (id: string, field: string, value: any) => {
    const updated = links.map(l => l.id === id ? { ...l, [field]: value } : l);
    setLinks(updated);
  };

  const handleSave = async (link: any) => {
    const { error } = await supabase.from("social_links").update({
      url: link.url, is_active: link.is_active,
    }).eq("id", link.id);
    if (error) {
      toast({ title: "خطأ", description: "فشل في الحفظ", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ" });
      onRefresh();
    }
  };

  const handleAdd = async () => {
    if (!newPlatform.trim()) return;
    const { error } = await supabase.from("social_links").insert({
      platform: newPlatform.trim().toLowerCase(),
      url: newUrl.trim(),
      is_active: !!newUrl.trim(),
    });
    if (error) {
      toast({ title: "خطأ", description: error.message.includes("unique") ? "هذه المنصة موجودة بالفعل" : "فشل في الإضافة", variant: "destructive" });
    } else {
      setNewPlatform(""); setNewUrl("");
      toast({ title: "تم الإضافة" });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("social_links").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">إدارة روابط التواصل</h2>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <Label className="font-body text-sm">المنصة</Label>
          <Select value={newPlatform} onValueChange={setNewPlatform}>
            <SelectTrigger className="w-40"><SelectValue placeholder="اختر منصة" /></SelectTrigger>
            <SelectContent>
              {["facebook","instagram","tiktok","twitter","youtube","snapchat","whatsapp"].filter(
                p => !links.some(l => l.platform === p)
              ).map(p => (
                <SelectItem key={p} value={p}>{platformLabels[p] || p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label className="font-body text-sm">الرابط</Label>
          <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." dir="ltr" />
        </div>
        <Button onClick={handleAdd} className="gradient-teal text-primary-foreground gap-2 font-body">
          <Plus size={16} /> إضافة
        </Button>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="bg-card rounded-xl p-4 shadow-fabric flex flex-wrap items-center gap-4">
            <div className="font-body font-semibold text-foreground min-w-[100px]">
              {platformLabels[link.platform] || link.platform}
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                value={link.url}
                onChange={e => handleUpdate(link.id, "url", e.target.value)}
                placeholder="https://..."
                dir="ltr"
                className="font-body text-sm"
              />
            </div>
            <label className="flex items-center gap-2 font-body text-sm">
              <Switch
                checked={link.is_active}
                onCheckedChange={v => handleUpdate(link.id, "is_active", v)}
              />
              {link.is_active ? "نشط" : "قريباً"}
            </label>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => handleSave(link)} className="gap-1 font-body">
                <Save size={14} /> حفظ
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)} className="text-destructive">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
