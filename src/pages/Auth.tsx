import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import adamLogoLight from "@/assets/adam-logo-light.svg";
import adamLogoDark from "@/assets/adam-logo-dark.svg";
import { useTheme } from "@/contexts/ThemeContext";

const Auth = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        toast.error(lang === "ar" ? "خطأ في التسجيل" : "Sign up error", { description: error.message });
        return;
      }
      toast.success(lang === "ar" ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
      navigate("/profile");
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error(lang === "ar" ? "خطأ في الدخول" : "Login error", { description: error.message });
        return;
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
            {mode === "signup" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-body text-sm">
                  <UserIcon size={16} /> {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                </Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-body text-sm">
                <Mail size={16} /> {lang === "ar" ? "البريد الإلكتروني" : "Email"}
              </Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" required />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-body text-sm">
                <Lock size={16} /> {lang === "ar" ? "كلمة المرور" : "Password"}
              </Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" required />
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
