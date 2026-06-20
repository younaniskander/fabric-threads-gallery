import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/SectionHeader";

type Review = {
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  rating: number;
  text: string;
  textEn: string;
};

const reviews: Review[] = [
  {
    name: "منى عبد الرحمن",
    nameEn: "Mona Abdel Rahman",
    role: "مصممة ديكور",
    roleEn: "Interior Designer",
    rating: 5,
    text: "جودة الأقمشة ممتازة والألوان مطابقة تماماً للصور. تعاملت معهم في أكثر من مشروع والنتيجة دائماً رائعة.",
    textEn: "Excellent fabric quality and the colors match the photos perfectly. I've worked with them on multiple projects and the result is always great.",
  },
  {
    name: "أحمد سمير",
    nameEn: "Ahmed Samir",
    role: "صاحب ورشة تنجيد",
    roleEn: "Upholstery Workshop Owner",
    rating: 5,
    text: "أفضل مكان للأقمشة الفندقية والتنجيد. الأسعار منافسة والتواصل عبر الواتساب سريع جداً.",
    textEn: "The best place for hotel and upholstery fabrics. Competitive prices and very fast communication on WhatsApp.",
  },
  {
    name: "سارة محمود",
    nameEn: "Sara Mahmoud",
    role: "عميلة",
    roleEn: "Customer",
    rating: 5,
    text: "خامات فخمة وخدمة عملاء محترمة. وصلني الطلب في الوقت المحدد وبحالة ممتازة.",
    textEn: "Luxurious materials and respectful customer service. My order arrived on time and in excellent condition.",
  },
];

const Testimonials = () => {
  const { lang } = useLanguage();

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <SectionHeader title={lang === "ar" ? "آراء عملائنا" : "What Our Clients Say"} />
        <p className="mx-auto mt-3 max-w-xl font-body text-sm text-muted-foreground">
          {lang === "ar"
            ? "ثقة عملائنا هي أساس نجاحنا. إليك بعض آراء من تعاملوا مع آدم للقماش."
            : "Our clients' trust is the foundation of our success. Here is what some of them say about ADAM Fabrics."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-fabric"
          >
            <div className="mb-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  size={16}
                  className={s < r.rating ? "fill-gold text-gold" : "text-muted"}
                />
              ))}
            </div>
            <p className="flex-1 font-body text-sm leading-relaxed text-foreground">
              "{lang === "ar" ? r.text : r.textEn}"
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-primary">
                {(lang === "ar" ? r.name : r.nameEn).charAt(0)}
              </div>
              <div>
                <p className="flex items-center gap-1 font-body text-sm font-semibold text-foreground">
                  {lang === "ar" ? r.name : r.nameEn}
                  <BadgeCheck size={14} className="text-primary" />
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {lang === "ar" ? r.role : r.roleEn}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;