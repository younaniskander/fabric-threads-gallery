import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import PaymentMethods from "@/components/PaymentMethods";

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen } = useCart();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveOrderToDb = async () => {
    if (!user) return;
    try {
      await supabase.from("orders").insert({
        user_id: user.id,
        items: items.map((i) => ({
          name: lang === "ar" ? i.name : i.nameEn,
          price: i.price,
          quantity: i.quantity,
          color: i.colorName || null,
        })) as any,
        total_amount: totalPrice,
        status: totalPrice > 0 ? "pending" : "completed",
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user) {
      toast.error(
        lang === "ar"
          ? "يرجى تسجيل الدخول أولاً لإتمام الطلب"
          : "Please sign in first to complete your order"
      );
      return;
    }

    // All items (including free samples) go through Stripe checkout
    setLoading(true);
    try {
      await saveOrderToDb();

      // If all items are free (price === 0), skip Stripe and go straight to success
      if (totalPrice === 0) {
        clearCart();
        window.location.href = "/payment-success";
      } else {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            items: items.map((i) => ({
              id: i.id,
              quantity: i.quantity,
            })),
            currency: "egp",
          },
        });
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, "_blank");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ أثناء الدفع" : "Checkout error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: lang === "ar" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: lang === "ar" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 z-50 h-full w-full max-w-md bg-background border-border shadow-xl flex flex-col"
            style={{ [lang === "ar" ? "left" : "right"]: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="font-display text-lg text-foreground flex items-center gap-2">
                <ShoppingBag size={20} />
                {lang === "ar" ? "سلة التسوق" : "Shopping Cart"}
                {totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-body">
                    {lang === "ar" ? "السلة فارغة" : "Your cart is empty"}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}__${item.color || "default"}`} className="flex gap-3 bg-card rounded-lg border border-border p-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
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
                      <p className="text-sm font-semibold text-primary mt-1">{item.priceDisplay}</p>
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
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    {lang === "ar" ? "الإجمالي" : "Total"}
                  </span>
                  <span className="font-display text-lg text-foreground">
                    {totalPrice.toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-body font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? (lang === "ar" ? "جاري التحويل..." : "Redirecting...")
                    : (lang === "ar" ? "المتابعة إلى الدفع" : "Proceed to Checkout")}
                </button>
                <PaymentMethods compact />
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
  );
};

export default CartDrawer;
