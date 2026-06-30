import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import bannerUpholstery from "@/assets/banner-upholstery.jpg";
import bannerCurtains from "@/assets/banner-curtains.jpg";
import bannerNewCollection from "@/assets/banner-new-collection.jpg";

const CollectionBanners = () => {
  const { lang, t } = useLanguage();

  const collections = [
    {
      titleAr: "مجموعة التنجيد",
      titleEn: "Upholstery Collection",
      image: bannerUpholstery,
      link: "/gallery?category=upholstery",
      color: "from-primary/80 to-primary/40",
    },
    {
      titleAr: "وصل حديثاً",
      titleEn: "New Collection",
      image: bannerNewCollection,
      link: "/gallery",
      color: "from-accent/80 to-accent/40",
    },
    {
      titleAr: "مجموعة الستائر",
      titleEn: "Curtains Collection",
      image: bannerCurtains,
      link: "/gallery?category=curtains",
      color: "from-gold/80 to-gold/40",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.h2
        className="mb-10 text-center font-display text-3xl text-foreground md:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {t("section.collections")}
      </motion.h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {collections.map((col, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <Link
              to={col.link}
              className="group relative block h-72 overflow-hidden rounded-xl md:h-80"
            >
              <img
                src={col.image}
                alt={lang === "ar" ? col.titleAr : col.titleEn}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${col.color}`} />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                <h3 className="mb-3 font-display text-2xl text-primary-foreground">
                  {lang === "ar" ? col.titleAr : col.titleEn}
                </h3>
                <span className="inline-block rounded-lg border border-primary-foreground/50 px-6 py-2 font-body text-xs text-primary-foreground transition-colors group-hover:bg-primary-foreground group-hover:text-foreground">
                  {t("section.shopNow")}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CollectionBanners;
