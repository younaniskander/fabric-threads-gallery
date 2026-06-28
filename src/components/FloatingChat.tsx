import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  defaultWhatsAppLink,
} from "@/lib/whatsapp";

const WhatsAppIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.515 5.26l-.999 3.648 3.74-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
  </svg>
);

const FloatingChat = () => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const link = defaultWhatsAppLink(lang);

  return (
    <div className="fixed bottom-6 left-6 z-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-72 rounded-2xl border border-border bg-card p-4 shadow-fabric-hover"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm text-foreground">
                {lang === "ar" ? "مرحباً! كيف أساعدك؟" : "Hi! How can we help?"}
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label={lang === "ar" ? "إغلاق" : "Close"}>
                <X size={18} />
              </button>
            </div>
            <div className="mb-3 rounded-lg bg-muted p-3">
              <p className="font-body text-xs text-muted-foreground">
                {lang === "ar"
                  ? "أهلاً بك في آدم للقماش! تواصل معنا عبر واتساب للاستفسار عن الأسعار والتوفر."
                  : "Welcome to ADAM Fabrics! Contact us on WhatsApp for prices and availability."}
              </p>
            </div>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-center font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon size={18} />
              {lang === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-fabric-hover transition-transform hover:scale-110"
        whileTap={{ scale: 0.95 }}
        aria-label={lang === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
      >
        <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-[#25D366] opacity-20" />
        <WhatsAppIcon size={30} />
      </motion.button>
    </div>
  );
};

export default FloatingChat;
