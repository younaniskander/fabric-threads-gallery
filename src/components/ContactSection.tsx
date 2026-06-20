import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Phone, MessageSquare, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { defaultWhatsAppLink, WHATSAPP_NUMBER_LOCAL } from "@/lib/whatsapp";
import { toast } from "sonner";

const ContactSection = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const message = form.message.trim();
    if (!name || !message) {
      toast.error(lang === "ar" ? "يرجى ملء الاسم والرسالة" : "Please fill name and message");
      return;
    }
    if (name.length > 100 || message.length > 2000 || (form.phone && form.phone.length > 20)) {
      toast.error(lang === "ar" ? "تجاوز الحد المسموح" : "Input too long");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      name,
      phone: form.phone.trim() || null,
      message,
      is_read: false,
      user_id: user?.id || null,
    });
    setSending(false);

    if (error) {
      toast.error(lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Error, please try again");
    } else {
      setSent(true);
      setForm({ name: "", phone: "", message: "" });
      setTimeout(() => setSent(false), 5000);
      toast.success(lang === "ar" ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!");
    }
  };

  return (
    <section id="contact-section" className="container mx-auto px-4 py-16">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            {lang === "ar" ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            {lang === "ar"
              ? "هل لديك استفسار أو ترغب في بدء مشروعك معنا؟ يسعدنا دائماً التواصل معك. فريقنا جاهز للإجابة على أسئلتك وتقديم الدعم الذي تحتاجه في أي وقت."
              : "Have a question or want to start your project with us? We're always happy to hear from you. Our team is ready to answer your questions and provide the support you need."}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={defaultWhatsAppLink(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.515 5.26l-.999 3.648 3.74-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
              </svg>
              {lang === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
            </a>
            <a
              href={`tel:+2${WHATSAPP_NUMBER_LOCAL}`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-body text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Phone size={16} className="text-primary" />
              <span dir="ltr">{WHATSAPP_NUMBER_LOCAL}</span>
            </a>
          </div>
        </div>

        {sent ? (
          <motion.div
            className="bg-card border border-border rounded-2xl p-10 text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle size={48} className="mx-auto text-primary mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">
              {lang === "ar" ? "تم الإرسال بنجاح!" : "Sent Successfully!"}
            </h3>
            <p className="font-body text-muted-foreground">
              {lang === "ar" ? "سنقوم بالرد عليك في أقرب وقت." : "We'll get back to you soon."}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-body text-sm text-foreground mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  {lang === "ar" ? "الاسم" : "Name"} <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={lang === "ar" ? "ادخل الاسم" : "Enter your name"}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="font-body text-sm text-foreground mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-primary" />
                  {lang === "ar" ? "رقم الجوال" : "Phone"}
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={lang === "ar" ? "00 000 0000" : "00 000 0000"}
                  maxLength={20}
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="font-body text-sm text-foreground mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-primary" />
                {lang === "ar" ? "كيف يمكننا المساعدة؟" : "How can we help?"} <span className="text-destructive">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={lang === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                maxLength={2000}
                required
                rows={5}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={sending}
                className="gap-2 px-8 py-2.5 font-body"
              >
                <Send size={16} />
                {sending
                  ? (lang === "ar" ? "جاري الإرسال..." : "Sending...")
                  : (lang === "ar" ? "ارسل الرسالة" : "Send Message")}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default ContactSection;
