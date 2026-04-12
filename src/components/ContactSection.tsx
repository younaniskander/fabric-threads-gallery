import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Phone, MessageSquare, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
