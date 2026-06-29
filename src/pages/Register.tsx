import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import mascotHappy from "@/assets/adam-logo-new.png";
import Seo from "@/components/Seo";
import { isValidCustomerName, isValidPhone } from "@/lib/phoneAuth";
import PhoneField from "@/components/PhoneField";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!user) {
      toast({ title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول أولاً لإتمام التسجيل", variant: "destructive" });
      return;
    }

    if (!isValidCustomerName(trimmedName)) {
      toast({ title: "خطأ", description: "اكتب الاسم ثنائي (الاسم الأول واسم العائلة)", variant: "destructive" });
      return;
    }
    if (!isValidPhone(trimmedPhone)) {
      toast({ title: "خطأ", description: "اختر الدولة واكتب رقم هاتف صحيح", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("customers")
      .insert({ name: trimmedName, phone: trimmedPhone, user_id: user.id });
    setLoading(false);

    if (error) {
      toast({ title: "خطأ", description: "حدث خطأ في التسجيل، حاول مرة أخرى", variant: "destructive" });
    } else {
      setSuccess(true);
      setName("");
      setPhone("");
      toast({ title: "تم التسجيل بنجاح! 🎉", description: "شكراً لتسجيلك معنا" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="تسجيل عميل جديد | آدم للأقمشة"
        description="سجّل بياناتك لدى آدم للأقمشة لتصلك أحدث العروض والمجموعات الجديدة من أقمشة التنجيد والستائر."
        path="/register"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div className="mx-auto max-w-md rounded-2xl bg-card p-8 shadow-fabric" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <img src={mascotHappy} alt="مرحباً" className="mx-auto mb-4 h-24 w-24 object-contain" />
            <h1 className="mb-2 font-display text-3xl text-foreground">تسجيل بيانات العميل</h1>
            <p className="font-body text-sm text-muted-foreground">سجّل بياناتك لنتمكن من التواصل معك</p>
          </div>

          {success ? (
            <motion.div className="py-8 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <div className="mb-4 text-5xl">✅</div>
              <h2 className="mb-2 font-display text-2xl text-primary">تم التسجيل بنجاح!</h2>
              <p className="mb-6 font-body text-muted-foreground">سنتواصل معك قريباً</p>
              <Button onClick={() => setSuccess(false)} className="gradient-teal text-primary-foreground">
                تسجيل عميل آخر
              </Button>
            </motion.div>
          ) : !user ? (
            <div className="py-8 text-center">
              <p className="mb-6 font-body text-muted-foreground">يرجى تسجيل الدخول أولاً حتى نتمكن من حفظ بياناتك بأمان.</p>
              <Button asChild className="gradient-teal text-primary-foreground">
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 font-body text-sm text-foreground">
                  <User size={16} /> الاسم الكامل
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك الكامل" maxLength={100} className="text-right font-body" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 font-body text-sm text-foreground">
                  <Phone size={16} /> رقم الهاتف
                </Label>
                <PhoneField value={phone} onChange={setPhone} placeholder="رقم الهاتف" />
              </div>
              <Button type="submit" disabled={loading} className="gradient-teal w-full py-3 font-body font-semibold text-primary-foreground">
                {loading ? <span className="flex items-center gap-2">جاري التسجيل...</span> : <span className="flex items-center gap-2"><UserPlus size={18} /> تسجيل</span>}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
