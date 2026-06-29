import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidCustomerName, isValidPhone, phoneToAuthCredentials } from "@/lib/phoneAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhoneField from "@/components/PhoneField";
import adamLogoLight from "@/assets/adam-logo-new.png";
import adamLogoDark from "@/assets/adam-logo-new.png";
import { useTheme } from "@/contexts/ThemeContext";

const Auth = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();

    if (!isValidCustomerName(trimmedName)) {
      toast.error(lang === "ar" ? "اكتب الاسم ثنائي (الاسم الأول واسم العائلة)" : "Enter your full name (first and last)");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error(lang === "ar" ? "اختر الدولة واكتب رقم هاتف صحيح" : "Select country and enter a valid phone number");
      return;
    }

    const credentials = phoneToAuthCredentials(phone, trimmedName);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(credentials.email, credentials.password, trimmedName, credentials.normalizedPhone);
      setLoading(false);
      if (error) {
        toast.error(lang === "ar" ? "تعذر إنشاء الحساب" : "Sign up error", {
          description: lang === "ar" ? "لو الرقم مسجل قبل كده جرّب تسجيل الدخول" : "If this phone is already registered, try signing in",
        });
        return;
      }
      toast.success(lang === "ar" ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
      navigate("/profile");
    } else {
      const { error } = await signIn(credentials.email, credentials.password);
      setLoading(false);
      if (error) {
        toast.error(lang === "ar" ? "الرقم غير مسجل" : "Phone not registered", {
          description: lang === "ar" ? "أنشئ حساب جديد بنفس الاسم ورقم الهاتف" : "Create a new account with your name and phone",
        });
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ full_name: trimmedName, phone: credentials.normalizedPhone, updated_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-md rounded-2xl bg-card p-8 shadow-fabric border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 text-center">
            <img src={theme === "dark" ? adamLogoDark : adamLogoLight} alt="ADAM" className="mx-auto mb-4 h-20 object-contain" />
            <h1 className="font-display text-2xl text-foreground">
              {mode === "login"
                ? (lang === "ar" ? "تسجيل الدخول" : "Sign In")
                : (lang === "ar" ? "إنشاء حساب جديد" : "Create Account")}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-body text-sm">
                <UserIcon size={16} /> {lang === "ar" ? "الاسم الكامل" : "Full name"}
              </Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} required />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-body text-sm">
                <Phone size={16} /> {lang === "ar" ? "رقم الهاتف" : "Phone number"}
              </Label>
              <PhoneField value={phone} onChange={setPhone} placeholder={lang === "ar" ? "رقم الهاتف" : "Phone number"} />
            </div>
            <Button type="submit" disabled={loading} className="w-full font-body font-semibold">
              {loading
                ? (lang === "ar" ? "جاري..." : "Loading...")
                : mode === "login"
                  ? (lang === "ar" ? "دخول" : "Sign In")
                  : (lang === "ar" ? "إنشاء حساب" : "Sign Up")}
            </Button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-muted-foreground">
            {mode === "login"
              ? (lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?")
              : (lang === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?")}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="ms-1 text-primary font-semibold hover:underline"
            >
              {mode === "login"
                ? (lang === "ar" ? "سجّل الآن" : "Sign Up")
                : (lang === "ar" ? "سجّل دخول" : "Sign In")}
            </button>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
