import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import adamLogoLight from "@/assets/adam-logo-new.png";
import adamLogoDark from "@/assets/adam-logo-new.png";
import { useTheme } from "@/contexts/ThemeContext";

const AdminLogin = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      setLoading(false);
      toast({ title: "خطأ في الدخول", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة", variant: "destructive" });
      return;
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");

    setLoading(false);

    if (roles && roles.length > 0) {
      navigate("/admin");
    } else {
      await supabase.auth.signOut();
      toast({ title: "غير مصرح", description: "هذا الحساب ليس لديه صلاحيات المشرف", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-fabric"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 text-center">
          <img src={theme === "dark" ? adamLogoDark : adamLogoLight} alt="ADAM Fabrics" className="mx-auto mb-4 h-20 w-20" />
          <h1 className="font-display text-2xl text-foreground">لوحة تحكم المشرف</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">تسجيل دخول المشرف</p>
        </div>


        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 font-body text-sm">
              <Mail size={16} /> البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              dir="ltr"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 font-body text-sm">
              <Lock size={16} /> كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="gradient-teal w-full font-body font-semibold text-primary-foreground">
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
