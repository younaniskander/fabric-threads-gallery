import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { type Fabric } from "@/data/fabrics";
import { useFabrics } from "@/hooks/useFabrics";
import { useLanguage } from "@/contexts/LanguageContext";
import FabricCard from "@/components/FabricCard";
import SectionHeader from "@/components/SectionHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const categoryConfig: Record<string, { ar: string; en: string; filter: (f: Fabric) => boolean }> = {
  upholstery: {
    ar: "أقمشة التنجيد",
    en: "Upholstery Fabrics",
    filter: (f) => f.category === "upholstery",
  },
  velvet: {
    ar: "أقمشة المخمل",
    en: "Velvet Fabrics",
    filter: (f) => f.type === "velvet",
  },
  print: {
    ar: "أقمشة مطبوعة",
    en: "Printed Fabrics",
    filter: (f) => f.features.some((feat) => feat.includes("مطبوع") || feat.includes("print")),
  },
  drapes: {
    ar: "أقمشة الستائر",
    en: "Drape Fabrics",
    filter: (f) => f.category === "curtains",
  },
  embroidery: {
    ar: "أقمشة مطرزة",
    en: "Embroidery Fabrics",
    filter: (f) => f.features.some((feat) => feat.includes("مطرز") || feat.includes("embroider")),
  },
  "like-leather": {
    ar: "أقمشة شبه جلد",
    en: "Like-Leather Fabrics",
    filter: (f) => f.type === "denim" || f.features.some((feat) => feat.includes("جلد") || feat.includes("leather")),
  },
  plain: {
    ar: "أقمشة سادة",
    en: "Plain Fabrics",
    filter: (f) => f.type === "cotton" || f.type === "linen",
  },
  hotels: {
    ar: "أقمشة فندقية",
    en: "Hotel Fabrics",
    filter: (f) => f.usage.some((u) => u.includes("فندق") || u.includes("hotel") || u.includes("صالون")),
  },
  "ready-made-curtains": {
    ar: "ستائر جاهزة",
    en: "Ready-made Curtains",
    filter: (f) => f.category === "curtains",
  },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const config = slug ? categoryConfig[slug] : null;
  const fabrics = useFabrics();

  const filtered = config ? fabrics.filter(config.filter) : [];
  const title = config ? config[lang === "ar" ? "ar" : "en"] : "";

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${title || "تصنيف الأقمشة"} | آدم للأقمشة`}
        description={`تصفّح ${title || "تشكيلة الأقمشة"} من آدم للأقمشة بأجود الخامات والألوان المتنوعة المناسبة لاحتياجك.`}
        path={`/category/${slug ?? ""}`}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <SectionHeader title={title} subtitle="" />

        {filtered.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <FabricCard fabric={f} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground mb-2">
              {lang === "ar" ? "قريباً" : "Coming Soon"}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {lang === "ar" ? "سيتم إضافة منتجات هذا القسم قريباً" : "Products will be added to this section soon"}
            </p>
            <Link to="/gallery" className="inline-block mt-6 text-sm text-primary hover:underline font-body">
              {lang === "ar" ? "تصفح كل الأقمشة" : "Browse all fabrics"}
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
