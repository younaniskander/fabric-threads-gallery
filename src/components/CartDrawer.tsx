import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatMoney, parsePriceAmount, isValidCustomerName, isValidEgyptPhone, isValidAddress } from "@/lib/phoneAuth";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen } = useCart();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const subtotal = totalPrice;
  const grandTotal = subtotal;
  const getItemUnitPrice = (price: number, priceDisplay: string) => price || parsePriceAmount(priceDisplay);

  const buildOrderMessage = () => {
    const lines = items
      .map((i, idx) => {
        const name = lang === "ar" ? i.name : i.nameEn;
        const unit = getItemUnitPrice(i.price, i.priceDisplay);
        const color = i.colorName ? ` (${i.colorName})` : "";
        return `${idx + 1}. ${name}${color} × ${i.quantity} = ${formatMoney(unit * i.quantity, lang)}`;
      })
      .join("\n");

    if (lang === "ar") {
      return (
        `🛍️ طلب جديد من آدم للأقمشة\n\n` +
        `👤 الاسم: ${form.name.trim()}\n` +
        `📞 رقم الهاتف: ${form.phone.trim()}\n` +
        `📍 العنوان: ${form.address.trim()}\n` +
        (form.notes.trim() ? `📝 ملاحظات: ${form.notes.trim()}\n` : "") +
        `\n🧾 المنتجات:\n${lines}\n\n` +
        `💰 الإجمالي: ${formatMoney(grandTotal, lang)}\n` +
        `💵 الدفع عند الاستلام`
      );
    }
    return (
      `🛍️ New order from ADAM Fabrics\n\n` +
      `👤 Name: ${form.name.trim()}\n` +
      `📞 Phone: ${form.phone.trim()}\n` +
      `📍 Address: ${form.address.trim()}\n` +
      (form.notes.trim() ? `📝 Notes: ${form.notes.trim()}\n` : "") +
      `\n🧾 Items:\n${lines}\n\n` +
      `💰 Total: ${formatMoney(grandTotal, lang)}\n` +
      `💵 Cash on delivery`
    );
  };

  // Prefill from profile when dialog opens
  useEffect(() => {
    if (!showForm || !user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      setForm((f) => ({
        ...f,
        name: f.name || data?.full_name || "",
        phone: f.phone || data?.phone || "",
      }));
    })();
  }, [showForm, user]);

  const openCheckout = () => {
    if (items.length === 0) return;
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول أولاً لإتمام الطلب" : "Please sign in first");
      navigate("/auth");
      setIsOpen(false);
      return;
    }
    setShowForm(true);
  };

  const submitOrder = async () => {
    if (!user) return;
    if (!isValidCustomerName(form.name)) {
      toast.error(lang === "ar" ? "اكتب الاسم ثنائي (الاسم الأول واسم العائلة)" : "Enter your full name (first and last)");
      return;
    }
    if (!isValidEgyptPhone(form.phone)) {
      toast.error(lang === "ar" ? "اكتب رقم موبايل صحيح مكوّن من 11 رقم" : "Enter a valid 11-digit mobile number");
      return;
    }
    if (!isValidAddress(form.address)) {
      toast.error(lang === "ar" ? "اكتب العنوان بالتفصيل (المحافظة والمدينة والشارع)" : "Enter a detailed address");
      return;
    }
    setLoading(true);
    const waMessage = buildOrderMessage();
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        items: items.map((i) => ({
          name: lang === "ar" ? i.name : i.nameEn,
          price: getItemUnitPrice(i.price, i.priceDisplay),
          quantity: i.quantity,
          color: i.colorName || null,
        })) as any,
        subtotal,
        discount_amount: 0,
        shipping_amount: 0,
        total_amount: grandTotal,
        status: "pending",
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
      clearCart();
      setShowForm(false);
      setIsOpen(false);
      // Open WhatsApp with the full order details for the customer to confirm.
      window.open(buildWhatsAppLink(waMessage), "_blank");
      navigate("/payment-success");
    } catch (err: any) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: lang === "ar" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: lang === "ar" ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 z-50 h-full w-full max-w-md bg-background border-border shadow-xl flex flex-col"
              style={{ [lang === "ar" ? "left" : "right"]: 0 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <h2 className="font-display text-lg text-foreground flex items-center gap-2">
                  <ShoppingBag size={20} />
                  {lang === "ar" ? "سلة التسوق" : "Shopping Cart"}
                  {totalItems > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{totalItems}</span>
                  )}
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-body">
                      {lang === "ar" ? "السلة فارغة" : "Your cart is empty"}
                    </p>
                  </div>
                ) : (
                  items.map((item) => {
                    const unitPrice = getItemUnitPrice(item.price, item.priceDisplay);
                    const lineTotal = unitPrice * item.quantity;

                    return (
                    <div key={`${item.id}__${item.color || "default"}`} className="flex gap-3 bg-card rounded-lg border border-border p-3">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body text-sm text-foreground truncate">
                          {lang === "ar" ? item.name : item.nameEn}
                        </h4>
                        {item.colorName && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-muted-foreground">{item.colorName}</span>
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-primary">{formatMoney(unitPrice, lang)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs font-medium text-foreground">{formatMoney(lineTotal, lang)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}
                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-body font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id, item.color)}
                            className="ms-auto p-1.5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-border px-4 py-4 space-y-3">
                  <div className="space-y-1.5 font-body text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{lang === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span>{formatMoney(subtotal, lang)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="font-body text-sm text-muted-foreground">
                        {lang === "ar" ? "الإجمالي" : "Total"}
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {formatMoney(grandTotal, lang)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={openCheckout}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-body font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    {lang === "ar" ? "إتمام الطلب (الدفع عند الاستلام)" : "Complete Order (Cash on Delivery)"}
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-sm text-muted-foreground hover:text-destructive font-body transition-colors"
                  >
                    {lang === "ar" ? "تفريغ السلة" : "Clear Cart"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {lang === "ar" ? "بيانات التوصيل" : "Delivery Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="font-body text-sm">{lang === "ar" ? "الاسم بالكامل *" : "Full name *"}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-body" />
            </div>
            <div>
              <Label className="font-body text-sm">{lang === "ar" ? "رقم الهاتف *" : "Phone *"}</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            </div>
            <div>
              <Label className="font-body text-sm">{lang === "ar" ? "العنوان بالتفصيل *" : "Address *"}</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={lang === "ar" ? "المحافظة، المدينة، الشارع، رقم المبنى..." : "Governorate, city, street..."}
                rows={3}
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-body text-sm">{lang === "ar" ? "ملاحظات (اختياري)" : "Notes (optional)"}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="font-body"
              />
            </div>
            <div className="space-y-1.5 rounded-lg bg-muted px-3 py-2.5 font-body text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{lang === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                <span>{formatMoney(subtotal, lang)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="text-muted-foreground">{lang === "ar" ? "الإجمالي:" : "Total:"}</span>
                <span className="font-bold text-primary">{formatMoney(grandTotal, lang)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={submitOrder} disabled={loading} className="font-body gap-2">
              {loading ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") : (lang === "ar" ? "تأكيد الطلب عبر واتساب" : "Confirm via WhatsApp")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartDrawer;
