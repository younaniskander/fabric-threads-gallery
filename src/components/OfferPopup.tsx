import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "adam_offer_popup_seen";

const OfferPopup = () => {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={close}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
              <button
                onClick={close}
                aria-label={lang === "ar" ? "إغلاق" : "Close"}
                className="absolute end-3 top-3 z-10 rounded-full bg-background/70 p-2 text-foreground hover:bg-background"
              >
                <X size={18} />
              </button>

              <div className="bg-gradient-to-br from-primary/20 via-background to-accent/20 px-6 pt-10 pb-6 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles size={24} />
                </div>
                <h2 className="font-display text-2xl text-foreground">
                  {lang === "ar" ? "عرض خاص لزوارنا الجدد" : "Special Offer for New Visitors"}
                </h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "خصومات حصرية على تشكيلتنا المختارة من الأقمشة الفاخرة"
                    : "Exclusive discounts on our curated selection of premium fabrics"}
                </p>
              </div>

              <div className="px-6 py-5">
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                    {lang === "ar" ? "وفّر حتى" : "Save up to"}
                  </p>
                  <p className="font-display text-4xl text-primary">20%</p>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    {lang === "ar" ? "على المنتجات المختارة" : "on selected products"}
                  </p>
                </div>

                <Link
                  to="/gallery"
                  onClick={close}
                  className="mt-5 block w-full rounded-lg bg-primary py-3 text-center font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {lang === "ar" ? "تسوق الآن" : "Shop Now"}
                </Link>
                <button
                  onClick={close}
                  className="mt-2 w-full py-2 text-center font-body text-xs text-muted-foreground hover:text-foreground"
                >
                  {lang === "ar" ? "ربما لاحقاً" : "Maybe later"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;
