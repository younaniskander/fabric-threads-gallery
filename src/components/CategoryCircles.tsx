import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import fabricVelvet from "@/assets/cat-velvet.jpg";
import fabricCotton from "@/assets/cat-cotton.jpg";
import fabricSilk from "@/assets/cat-silk.jpg";
import fabricLinen from "@/assets/cat-linen.jpg";
import fabricSatin from "@/assets/cat-satin.jpg";
import fabricDenim from "@/assets/cat-denim.jpg";

const categories = [
  { id: "velvet", nameAr: "مخمل", nameEn: "Velvet", image: fabricVelvet, filter: "velvet" },
  { id: "cotton", nameAr: "قطن", nameEn: "Cotton", image: fabricCotton, filter: "cotton" },
  { id: "silk", nameAr: "حرير", nameEn: "Silk", image: fabricSilk, filter: "silk" },
  { id: "linen", nameAr: "كتان", nameEn: "Linen", image: fabricLinen, filter: "linen" },
  { id: "satin", nameAr: "ساتان", nameEn: "Satin", image: fabricSatin, filter: "satin" },
  { id: "denim", nameAr: "دنيم", nameEn: "Denim", image: fabricDenim, filter: "denim" },
];

const CategoryCircles = () => {
  const { lang, t } = useLanguage();

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.h2
        className="mb-10 text-start font-display text-3xl text-foreground md:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {t("section.shopByCategory")}
      </motion.h2>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide md:justify-center">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0"
          >
            <Link
              to={`/gallery?type=${cat.filter}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-border transition-all group-hover:border-primary group-hover:shadow-fabric-hover md:h-36 md:w-36">
                <img
                  src={cat.image}
                  alt={lang === "ar" ? cat.nameAr : cat.nameEn}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="font-body text-sm font-medium text-foreground uppercase tracking-wide">
                {lang === "ar" ? cat.nameAr : cat.nameEn}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCircles;
