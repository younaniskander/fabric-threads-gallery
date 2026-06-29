import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, XCircle, Phone, MapPin, User, Package, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

type Order = {
  id: string;
  user_id: string;
  items: any;
  total_amount: number;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  notes: string | null;
  created_at: string;
};

type StatusKey = "pending" | "delivered" | "cancelled";

const STATUS_TABS: { id: StatusKey; label: string; icon: any; color: string }[] = [
  { id: "pending", label: "قيد التنفيذ", icon: Clock, color: "text-amber-600" },
  { id: "delivered", label: "تم التسليم", icon: CheckCircle2, color: "text-green-600" },
  { id: "cancelled", label: "ملغية", icon: XCircle, color: "text-red-600" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG");
}

function customerWhatsAppLink(phone: string | null, name: string | null) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "20" + digits.slice(1);
  if (!digits.startsWith("20") && digits.length === 10) digits = "20" + digits;
  const msg = `مرحباً ${name || ""}، بخصوص طلبك من آدم للأقمشة 🛍️`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

const OrdersSection = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<StatusKey>("pending");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => orders.filter((o) => o.status === active), [orders, active]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of filtered) {
      const key = o.created_at.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const grandTotal = useMemo(() => filtered.reduce((s, o) => s + Number(o.total_amount || 0), 0), [filtered]);

  const updateStatus = async (id: string, status: StatusKey) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: "فشل تحديث الحالة", variant: "destructive" });
      return;
    }
    toast({ title: "تم التحديث" });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl text-foreground">إدارة الطلبات</h2>
        <div className="bg-card border border-border rounded-lg px-4 py-2 font-body text-sm">
          الإجمالي الكلي:{" "}
          <span className="font-bold text-primary">{grandTotal.toLocaleString("ar-EG")} ج.م</span>
          <span className="text-muted-foreground"> ({filtered.length} طلب)</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-card rounded-lg border border-border p-1 w-fit">
        {STATUS_TABS.map((s) => {
          const count = orders.filter((o) => o.status === s.id).length;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-body transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <s.icon size={16} />
              {s.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 font-body text-muted-foreground">جاري التحميل...</div>
      ) : groupedByDay.length === 0 ? (
        <div className="text-center py-12 font-body text-muted-foreground bg-card rounded-xl border border-border">
          لا توجد طلبات في هذا القسم
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map(([day, dayOrders]) => {
            const dayTotal = dayOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
            return (
              <div key={day} className="space-y-3">
                <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-2 sticky top-[112px] z-10">
                  <div className="font-body text-sm font-semibold text-foreground">{fmtDate(dayOrders[0].created_at)}</div>
                  <div className="font-body text-sm">
                    <span className="text-muted-foreground">{dayOrders.length} طلب — </span>
                    <span className="font-bold text-primary">{dayTotal.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {dayOrders.map((o) => (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-body text-sm text-foreground">
                            <User size={14} className="text-muted-foreground" />
                            <span className="font-semibold">{o.customer_name || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                            <Phone size={12} />
                            <a href={`tel:${o.customer_phone || ""}`} dir="ltr" className="hover:text-primary">
                              {o.customer_phone || "—"}
                            </a>
                          </div>
                          <div className="flex items-start gap-2 font-body text-xs text-muted-foreground">
                            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{o.customer_address || "—"}</span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="font-display text-lg text-primary">{Number(o.total_amount).toLocaleString("ar-EG")} ج.م</div>
                          <div className="font-body text-[10px] text-muted-foreground">{fmtTime(o.created_at)}</div>
                        </div>
                      </div>

                      {o.notes && (
                        <div className="bg-muted rounded-md px-3 py-2 font-body text-xs text-muted-foreground">
                          ملاحظات: {o.notes}
                        </div>
                      )}

                      <div className="border-t border-border pt-3 space-y-1.5">
                        <div className="flex items-center gap-2 font-body text-xs font-semibold text-foreground">
                          <Package size={12} /> المنتجات ({Array.isArray(o.items) ? o.items.length : 0})
                        </div>
                        {Array.isArray(o.items) &&
                          o.items.map((it: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between font-body text-xs">
                              <span className="text-muted-foreground">
                                {it.name}
                                {it.color ? ` — ${it.color}` : ""}
                                <span className="text-foreground"> × {it.quantity}</span>
                              </span>
                              <span className="text-foreground">{(Number(it.price) * Number(it.quantity)).toLocaleString("ar-EG")} ج.م</span>
                            </div>
                          ))}
                      </div>

                      {active === "pending" && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(o.id, "delivered")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-body"
                          >
                            <CheckCircle2 size={14} className="me-1" /> تم التسليم
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(o.id, "cancelled")}
                            className="flex-1 font-body"
                          >
                            <XCircle size={14} className="me-1" /> إلغاء
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
