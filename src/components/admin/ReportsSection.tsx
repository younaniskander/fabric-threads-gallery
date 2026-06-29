import { useEffect, useState } from "react";
import { BarChart3, Download, TrendingUp, ShoppingCart, Gift, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/csv";

const ReportsSection = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any[]>([]);
  const [range, setRange] = useState<"7" | "30" | "all">("30");

  useEffect(() => {
    (async () => {
      const [o, p, l] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("pos_sales").select("*").order("created_at", { ascending: false }),
        supabase.from("loyalty_transactions").select("*").order("created_at", { ascending: false }),
      ]);
      setOrders(o.data || []);
      setPos(p.data || []);
      setLoyalty(l.data || []);
    })();
  }, []);

  const cutoff = range === "all" ? 0 : Date.now() - Number(range) * 86400000;
  const inRange = (d: string) => range === "all" || new Date(d).getTime() >= cutoff;

  const fOrders = orders.filter((o) => inRange(o.created_at));
  const validOrders = fOrders.filter((o) => !["cancelled", "returned", "refunded", "rejected"].includes(o.status));
  const fPos = pos.filter((p) => inRange(p.created_at));
  const fLoyalty = loyalty.filter((l) => inRange(l.created_at));

  const onlineRevenue = validOrders.reduce((a, o) => a + Number(o.total_amount || 0), 0);
  const posRevenue = fPos.reduce((a, p) => a + Number(p.total_amount || 0), 0);
  const pointsEarned = fLoyalty.filter((l) => l.points > 0).reduce((a, l) => a + l.points, 0);
  const pointsRedeemed = Math.abs(fLoyalty.filter((l) => l.points < 0).reduce((a, l) => a + l.points, 0));
  const discountsGiven = validOrders.reduce((a, o) => a + Number(o.discount_amount || 0), 0);

  const fmt = (n: number) => `${n.toLocaleString("ar-EG")} ج.م`;

  const cards = [
    { label: "إيرادات المتجر", value: fmt(onlineRevenue), icon: ShoppingCart, color: "text-primary" },
    { label: "إيرادات الكاشير", value: fmt(posRevenue), icon: TrendingUp, color: "text-accent" },
    { label: "إجمالي الطلبات", value: validOrders.length, icon: BarChart3, color: "text-gold" },
    { label: "نقاط مكتسبة", value: pointsEarned.toLocaleString("ar-EG"), icon: Gift, color: "text-green-600" },
    { label: "نقاط مستبدلة", value: pointsRedeemed.toLocaleString("ar-EG"), icon: Gift, color: "text-orange-500" },
    { label: "إجمالي الخصومات", value: fmt(discountsGiven), icon: Tag, color: "text-destructive" },
  ];

  const exportOrders = () => {
    exportToCsv(`orders_${range}d`, fOrders.map((o) => ({
      date: new Date(o.created_at).toLocaleString("ar-EG"),
      customer: o.customer_name, phone: o.customer_phone, status: o.status,
      subtotal: o.subtotal, discount: o.discount_amount, shipping: o.shipping_amount, total: o.total_amount, coupon: o.coupon_code || "",
    })));
  };
  const exportPos = () => {
    exportToCsv(`pos_${range}d`, fPos.map((p) => ({
      date: new Date(p.created_at).toLocaleString("ar-EG"), receipt: p.receipt_no,
      subtotal: p.subtotal, discount: p.discount_amount, total: p.total_amount, payment: p.payment_method,
    })));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(["7", "30", "all"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md font-body text-sm ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {r === "all" ? "الكل" : `آخر ${r} يوم`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={exportOrders} variant="outline" size="sm" className="gap-1 font-body"><Download size={14} /> تصدير الطلبات</Button>
          <Button onClick={exportPos} variant="outline" size="sm" className="gap-1 font-body"><Download size={14} /> تصدير الكاشير</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl p-6 shadow-fabric">
            <c.icon className={`${c.color} mb-2`} size={24} />
            <div className="font-display text-2xl text-foreground">{c.value}</div>
            <div className="font-body text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-5 shadow-fabric">
        <h3 className="mb-4 font-display text-lg text-foreground">حالة الطلبات</h3>
        <div className="space-y-2">
          {Object.entries(fOrders.reduce((acc: Record<string, number>, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="font-body text-sm text-foreground w-28">{status}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${((count as number) / Math.max(1, fOrders.length)) * 100}%` }} />
              </div>
              <span className="font-body text-xs text-muted-foreground w-8 text-left">{count as number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;