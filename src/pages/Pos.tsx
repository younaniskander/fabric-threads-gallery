import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ScanLine, UserPlus, Trash2, Plus, Minus, Printer, X, Receipt,
  CreditCard, Wallet, Banknote, RotateCcw, ShoppingBag, LogOut, Store,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "@/components/QrScanner";
import { LOYALTY_QR_PREFIX } from "@/components/LoyaltyCard";

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  loyalty_points: number;
  membership_level: string;
  loyalty_card_token: string;
};
type Line = { id: string; name: string; price: number; qty: number };
type Branch = { id: string; name_ar: string; name: string };
type Level = { key: string; name_ar: string; discount_percent: number };
type Rules = { points_per_currency: number; point_value: number; min_redeem_points: number; enabled: boolean };

const parsePrice = (txt: string | null) => {
  if (!txt) return 0;
  const m = txt.replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

const Pos = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { can, loading: permLoading } = usePermissions();
  const { toast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [levels, setLevels] = useState<Level[]>([]);
  const [rules, setRules] = useState<Rules>({ points_per_currency: 1, point_value: 0.1, min_redeem_points: 100, enabled: true });

  // product search
  const [pq, setPq] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; price: string | null }[]>([]);
  const [cart, setCart] = useState<Line[]>([]);

  // customer
  const [cq, setCq] = useState("");
  const [custResults, setCustResults] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  // payment
  const [manualDiscount, setManualDiscount] = useState("");
  const [redeem, setRedeem] = useState(false);
  const [redeemPts, setRedeemPts] = useState("");
  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [walletPay, setWalletPay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    (async () => {
      const [b, l, r] = await Promise.all([
        supabase.from("branches").select("id,name,name_ar").eq("is_active", true),
        supabase.from("membership_levels").select("key,name_ar,discount_percent"),
        supabase.from("loyalty_rules").select("*").limit(1).maybeSingle(),
      ]);
      setBranches((b.data as Branch[]) || []);
      if (b.data?.length) setBranchId(b.data[0].id);
      setLevels((l.data as Level[]) || []);
      if (r.data) setRules(r.data as Rules);
    })();
  }, []);

  useEffect(() => {
    if (!permLoading && !user) navigate("/auth");
  }, [permLoading, user, navigate]);

  // product search debounce
  useEffect(() => {
    if (pq.trim().length < 1) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("fabrics_db")
        .select("id,name,price")
        .ilike("name", `%${pq.trim()}%`)
        .limit(8);
      setResults(data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [pq]);

  const searchCustomer = async () => {
    const q = cq.trim();
    if (!q) return;
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,phone,loyalty_points,membership_level,loyalty_card_token")
      .or(`phone.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(8);
    setCustResults((data as Customer[]) || []);
    if (!data?.length) toast({ title: "لا يوجد عميل بهذا الاسم/الرقم", variant: "destructive" });
  };

  const lookupByToken = async (raw: string) => {
    const token = raw.startsWith(LOYALTY_QR_PREFIX) ? raw.slice(LOYALTY_QR_PREFIX.length) : raw;
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,phone,loyalty_points,membership_level,loyalty_card_token")
      .eq("loyalty_card_token", token.trim())
      .maybeSingle();
    if (data) {
      setCustomer(data as Customer);
      setCustResults([]);
      toast({ title: `تم التعرف على ${data.full_name || "العميل"}` });
    } else {
      toast({ title: "بطاقة غير معروفة", variant: "destructive" });
    }
  };

  const addToCart = (p: { id: string; name: string; price: string | null }) => {
    setCart((c) => {
      const ex = c.find((l) => l.id === p.id);
      if (ex) return c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { id: p.id, name: p.name, price: parsePrice(p.price), qty: 1 }];
    });
    setPq("");
    setResults([]);
  };

  const setQty = (id: string, d: number) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + d) } : l)));
  const setPrice = (id: string, v: number) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, price: v } : l)));
  const removeLine = (id: string) => setCart((c) => c.filter((l) => l.id !== id));

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.qty, 0), [cart]);
  const memberPct = useMemo(() => {
    if (!customer) return 0;
    return levels.find((l) => l.key === customer.membership_level)?.discount_percent || 0;
  }, [customer, levels]);
  const memberDiscount = useMemo(() => Math.round((subtotal * memberPct) / 100), [subtotal, memberPct]);
  const manualDisc = Math.min(subtotal, Number(manualDiscount) || 0);

  const maxRedeemable = customer ? customer.loyalty_points : 0;
  const redeemValue = useMemo(() => {
    if (!redeem || !customer) return 0;
    const pts = Math.min(maxRedeemable, Number(redeemPts) || 0);
    return Math.round(pts * rules.point_value);
  }, [redeem, redeemPts, customer, maxRedeemable, rules.point_value]);

  const total = Math.max(0, subtotal - memberDiscount - manualDisc - redeemValue);
  const paid = (Number(cash) || 0) + (Number(card) || 0) + (Number(walletPay) || 0);
  const pointsEarned = rules.enabled ? Math.floor(total * rules.points_per_currency) : 0;

  const resetSale = () => {
    setCart([]); setCustomer(null); setCq(""); setCustResults([]);
    setManualDiscount(""); setRedeem(false); setRedeemPts("");
    setCash(""); setCard(""); setWalletPay("");
  };

  const checkout = async () => {
    if (!cart.length) { toast({ title: "السلة فارغة", variant: "destructive" }); return; }
    if (paid + 0.001 < total) { toast({ title: "المبلغ المدفوع أقل من الإجمالي", variant: "destructive" }); return; }
    if (redeem && customer) {
      const pts = Number(redeemPts) || 0;
      if (pts > 0 && pts < rules.min_redeem_points) {
        toast({ title: `أقل عدد نقاط للاستبدال ${rules.min_redeem_points}`, variant: "destructive" });
        return;
      }
      if (pts > maxRedeemable) { toast({ title: "نقاط غير كافية", variant: "destructive" }); return; }
    }
    setSubmitting(true);
    const payments = [
      { method: "cash", amount: Number(cash) || 0 },
      { method: "card", amount: Number(card) || 0 },
      { method: "wallet", amount: Number(walletPay) || 0 },
    ].filter((p) => p.amount > 0);
    const usedRedeem = redeem && customer ? Math.min(maxRedeemable, Number(redeemPts) || 0) : 0;

    const { data: sale, error } = await supabase
      .from("pos_sales")
      .insert({
        branch_id: branchId || null,
        cashier_id: user!.id,
        customer_id: customer?.id || null,
        items: cart,
        subtotal,
        discount: memberDiscount + manualDisc + redeemValue,
        total,
        payment_method: payments.length > 1 ? "split" : payments[0]?.method || "cash",
        payments,
        points_earned: customer ? pointsEarned : 0,
        points_redeemed: usedRedeem,
        type: "sale",
      })
      .select()
      .single();

    if (error || !sale) {
      setSubmitting(false);
      toast({ title: "تعذّر إتمام البيع", description: error?.message, variant: "destructive" });
      return;
    }

    // Loyalty (in-store sale completes instantly)
    if (customer) {
      if (usedRedeem > 0) {
        await supabase.from("loyalty_transactions").insert({
          user_id: customer.id, points: -usedRedeem, type: "redeem", reason: `pos:${sale.receipt_no}`,
        });
      }
      if (pointsEarned > 0) {
        await supabase.from("loyalty_transactions").insert({
          user_id: customer.id, points: pointsEarned, type: "earn", reason: `pos:${sale.receipt_no}`,
        });
      }
    }
    setSubmitting(false);
    setLastSale({ ...sale, change: paid - total, customerName: customer?.full_name });
    resetSale();
    toast({ title: `تم البيع — ${sale.receipt_no}` });
  };

  const loadHistory = async () => {
    const { data } = await supabase
      .from("pos_sales")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory(data || []);
    setShowHistory(true);
  };

  const refundSale = async (sale: any) => {
    if (sale.type !== "sale") return;
    const { error } = await supabase.from("pos_sales").insert({
      branch_id: sale.branch_id,
      cashier_id: user!.id,
      customer_id: sale.customer_id,
      items: sale.items,
      subtotal: -sale.subtotal,
      discount: -sale.discount,
      total: -sale.total,
      payment_method: sale.payment_method,
      payments: sale.payments,
      points_earned: 0,
      points_redeemed: 0,
      type: "refund",
      related_sale_id: sale.id,
      note: `استرجاع ${sale.receipt_no}`,
    });
    if (error) { toast({ title: "تعذّر الاسترجاع", variant: "destructive" }); return; }
    // reverse loyalty
    if (sale.customer_id) {
      if (sale.points_earned > 0)
        await supabase.from("loyalty_transactions").insert({ user_id: sale.customer_id, points: -sale.points_earned, type: "reverse", reason: `refund:${sale.receipt_no}` });
      if (sale.points_redeemed > 0)
        await supabase.from("loyalty_transactions").insert({ user_id: sale.customer_id, points: sale.points_redeemed, type: "refund_redeem", reason: `refund:${sale.receipt_no}` });
    }
    toast({ title: "تم الاسترجاع وإلغاء النقاط" });
    loadHistory();
  };

  const printReceipt = (sale: any) => {
    const w = window.open("", "_blank", "width=380,height=600");
    if (!w) return;
    const rows = (sale.items || [])
      .map((l: any) => `<tr><td>${l.name}</td><td style="text-align:center">${l.qty}</td><td style="text-align:left">${(l.price * l.qty).toFixed(2)}</td></tr>`)
      .join("");
    w.document.write(`
      <html dir="rtl"><head><meta charset="utf-8"><title>${sale.receipt_no}</title>
      <style>body{font-family:Tahoma,Arial;padding:12px;font-size:13px;color:#111}
      h2{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;margin:8px 0}
      td,th{padding:3px 0;border-bottom:1px dashed #ccc}.tot{font-weight:bold;font-size:15px}
      .c{text-align:center}.muted{color:#666;font-size:11px}</style></head>
      <body>
      <h2>ADAM Fabrics</h2>
      <p class="c muted">${sale.receipt_no} — ${new Date(sale.created_at || Date.now()).toLocaleString("ar-EG")}</p>
      ${sale.customerName ? `<p class="muted">العميل: ${sale.customerName}</p>` : ""}
      <table><thead><tr><th style="text-align:right">الصنف</th><th>كمية</th><th style="text-align:left">سعر</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <p>الإجمالي الفرعي: ${Number(sale.subtotal).toFixed(2)}</p>
      <p>الخصم: ${Number(sale.discount).toFixed(2)}</p>
      <p class="tot">الإجمالي: ${Number(sale.total).toFixed(2)} ج.م</p>
      ${sale.points_earned ? `<p class="muted">نقاط مكتسبة: ${sale.points_earned}</p>` : ""}
      <p class="c muted">شكراً لتعاملكم معنا</p>
      <script>window.print();</script>
      </body></html>`);
    w.document.close();
  };

  if (permLoading) return <div className="grid min-h-screen place-items-center font-body text-muted-foreground">جاري التحقق...</div>;
  if (!user) return null;
  if (!can("pos.use")) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted p-6 text-center" dir="rtl">
        <div className="rounded-2xl bg-card p-8 shadow-fabric">
          <Store className="mx-auto mb-3 text-muted-foreground" size={40} />
          <h1 className="font-display text-xl text-foreground">لا تملك صلاحية الكاشير</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">تواصل مع المدير لمنحك صلاحية "استخدام الكاشير".</p>
          <Button onClick={() => navigate("/")} className="mt-4 font-body">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted" dir="rtl">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-primary" size={22} />
          <h1 className="font-display text-lg text-foreground">نقطة البيع (POS)</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="h-9 w-40 font-body text-sm"><SelectValue placeholder="الفرع" /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name_ar || b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadHistory} className="gap-1 font-body"><Receipt size={15} /> الفواتير</Button>
          <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/"))} className="text-destructive"><LogOut size={16} /></Button>
        </div>
      </header>

      <div className="container mx-auto grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
        {/* Products */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-card p-4 shadow-fabric">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="ابحث عن منتج بالاسم..." className="pr-9 font-body" />
            </div>
            {results.length > 0 && (
              <div className="mt-2 max-h-60 space-y-1 overflow-auto">
                {results.map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-right font-body text-sm hover:bg-muted">
                    <span className="text-foreground">{p.name}</span>
                    <span className="text-muted-foreground">{p.price || "—"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-card p-4 shadow-fabric">
            <h2 className="mb-3 font-display text-base text-foreground">السلة ({cart.length})</h2>
            {cart.length === 0 ? (
              <p className="py-8 text-center font-body text-sm text-muted-foreground">أضف منتجات للبدء</p>
            ) : (
              <div className="space-y-2">
                {cart.map((l) => (
                  <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                    <span className="min-w-0 flex-1 truncate font-body text-sm text-foreground">{l.name}</span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(l.id, -1)}><Minus size={13} /></Button>
                      <span className="w-7 text-center font-body text-sm">{l.qty}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(l.id, 1)}><Plus size={13} /></Button>
                    </div>
                    <Input type="number" value={l.price} onChange={(e) => setPrice(l.id, Number(e.target.value))} className="h-8 w-24 font-body" dir="ltr" />
                    <span className="w-20 text-left font-body text-sm font-semibold">{(l.price * l.qty).toFixed(0)}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLine(l.id)}><Trash2 size={14} /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout panel */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-xl bg-card p-4 shadow-fabric">
            <h2 className="mb-3 font-display text-base text-foreground">العميل</h2>
            {customer ? (
              <div className="rounded-lg bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-body font-semibold text-foreground">{customer.full_name || "—"}</p>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCustomer(null)}><X size={15} /></Button>
                </div>
                <p className="font-body text-xs text-muted-foreground" dir="ltr">{customer.phone}</p>
                <div className="mt-2 flex items-center gap-3 font-body text-sm">
                  <span className="text-primary">النقاط: <b>{customer.loyalty_points}</b></span>
                  <span className="text-muted-foreground">المستوى: {levels.find((l) => l.key === customer.membership_level)?.name_ar || customer.membership_level}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input value={cq} onChange={(e) => setCq(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchCustomer()} placeholder="اسم أو رقم الهاتف" className="font-body" />
                  <Button size="icon" variant="outline" onClick={searchCustomer}><Search size={16} /></Button>
                  <Button size="icon" variant="outline" onClick={() => setScanOpen(true)}><ScanLine size={16} /></Button>
                </div>
                {custResults.length > 0 && (
                  <div className="mt-2 max-h-44 space-y-1 overflow-auto">
                    {custResults.map((c) => (
                      <button key={c.id} onClick={() => { setCustomer(c); setCustResults([]); }}
                        className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-right font-body text-sm hover:bg-muted">
                        <span>{c.full_name || "—"}</span>
                        <span className="text-muted-foreground" dir="ltr">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Totals + payment */}
          <div className="space-y-3 rounded-xl bg-card p-4 shadow-fabric">
            <div className="flex justify-between font-body text-sm"><span>الإجمالي الفرعي</span><span>{subtotal.toFixed(0)} ج.م</span></div>
            {memberDiscount > 0 && <div className="flex justify-between font-body text-sm text-green-600"><span>خصم العضوية ({memberPct}%)</span><span>-{memberDiscount}</span></div>}
            <div className="flex items-center justify-between gap-2">
              <Label className="font-body text-sm">خصم يدوي</Label>
              <Input type="number" value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} className="h-8 w-28 font-body" dir="ltr" />
            </div>

            {customer && (
              <div className="rounded-lg border border-border p-2">
                <label className="flex items-center justify-between font-body text-sm">
                  استبدال نقاط ({customer.loyalty_points})
                  <Switch checked={redeem} onCheckedChange={setRedeem} />
                </label>
                {redeem && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input type="number" value={redeemPts} onChange={(e) => setRedeemPts(e.target.value)} placeholder={`أدنى ${rules.min_redeem_points}`} className="h-8 font-body" dir="ltr" />
                    <span className="font-body text-xs text-muted-foreground">= {redeemValue} ج.م</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between border-t border-border pt-2 font-display text-lg text-foreground">
              <span>الإجمالي</span><span>{total.toFixed(0)} ج.م</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div><Label className="flex items-center gap-1 font-body text-xs"><Banknote size={13} /> كاش</Label><Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} className="h-8 font-body" dir="ltr" /></div>
              <div><Label className="flex items-center gap-1 font-body text-xs"><CreditCard size={13} /> بطاقة</Label><Input type="number" value={card} onChange={(e) => setCard(e.target.value)} className="h-8 font-body" dir="ltr" /></div>
              <div><Label className="flex items-center gap-1 font-body text-xs"><Wallet size={13} /> محفظة</Label><Input type="number" value={walletPay} onChange={(e) => setWalletPay(e.target.value)} className="h-8 font-body" dir="ltr" /></div>
            </div>
            <div className="flex justify-between font-body text-xs text-muted-foreground">
              <span>المدفوع: {paid.toFixed(0)}</span>
              <span>{paid - total >= 0 ? `الباقي: ${(paid - total).toFixed(0)}` : `ناقص: ${(total - paid).toFixed(0)}`}</span>
            </div>
            {customer && pointsEarned > 0 && <p className="font-body text-xs text-primary">سيكسب العميل {pointsEarned} نقطة</p>}

            <div className="flex gap-2">
              <Button onClick={() => setCash(total.toFixed(0))} variant="outline" className="flex-1 font-body text-xs">دفع كامل كاش</Button>
              <Button onClick={checkout} disabled={submitting} className="flex-1 gradient-teal font-body text-primary-foreground">
                {submitting ? "..." : "إتمام البيع"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {scanOpen && <QrScanner onClose={() => setScanOpen(false)} onScan={(t) => { setScanOpen(false); lookupByToken(t); }} />}

      {/* Last sale receipt */}
      {lastSale && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-xl">
            <Receipt className="mx-auto mb-2 text-primary" size={36} />
            <h3 className="font-display text-lg text-foreground">تم البيع بنجاح</h3>
            <p className="font-body text-sm text-muted-foreground">{lastSale.receipt_no}</p>
            <p className="mt-2 font-display text-2xl text-foreground">{Number(lastSale.total).toFixed(0)} ج.م</p>
            {lastSale.change > 0 && <p className="font-body text-sm text-green-600">الباقي: {lastSale.change.toFixed(0)} ج.م</p>}
            <div className="mt-4 flex gap-2">
              <Button onClick={() => printReceipt(lastSale)} variant="outline" className="flex-1 gap-1 font-body"><Printer size={15} /> طباعة</Button>
              <Button onClick={() => setLastSale(null)} className="flex-1 font-body">جديد</Button>
            </div>
          </div>
        </div>
      )}

      {/* History / reprint / refund */}
      {showHistory && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-card p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground">آخر الفواتير</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowHistory(false)}><X size={18} /></Button>
            </div>
            <div className="space-y-2 overflow-auto">
              {history.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-body text-sm text-foreground">{s.receipt_no} {s.type === "refund" && <span className="text-destructive">(استرجاع)</span>}</p>
                    <p className="font-body text-xs text-muted-foreground">{Number(s.total).toFixed(0)} ج.م — {new Date(s.created_at).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => printReceipt(s)}><Printer size={14} /></Button>
                    {s.type === "sale" && can("pos.returns") && (
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => refundSale(s)}><RotateCcw size={14} /></Button>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="py-6 text-center font-body text-sm text-muted-foreground">لا توجد فواتير</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pos;
