import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBanner from "@/assets/hero-banner.jpg";
import categoryUpholstery from "@/assets/category-upholstery.jpg";
import categoryCurtains from "@/assets/category-curtains.jpg";

const slides = [
  {
    image: heroBanner,
    titleAr: "آدم للأقمشة الفاخرة",
    titleEn: "ADAM Premium Fabrics",
    subtitleAr: "اكتشف أرقى أقمشة التنجيد والستائر",
    subtitleEn: "Discover the finest upholstery & curtain fabrics",
    ctaAr: "تسوق الآن",
    ctaEn: "Shop Now",
    link: "/gallery",
  },
  {
    image: categoryUpholstery,
    titleAr: "مجموعة التنجيد",
    titleEn: "Upholstery Collection",
    subtitleAr: "أقمشة أنتريهات فاخرة بألوان وخامات متنوعة",
    subtitleEn: "Premium sofa fabrics in various colors and textures",
    ctaAr: "استكشف المجموعة",
    ctaEn: "Explore Collection",
    link: "/gallery?category=upholstery",
  },
  {
    image: categoryCurtains,
    titleAr: "مجموعة الستائر",
    titleEn: "Curtains Collection",
    subtitleAr: "ستائر فاخرة بتصاميم عصرية وكلاسيكية",
    subtitleEn: "Luxury curtains with modern and classic designs",
    ctaAr: "تصفح الستائر",
    ctaEn: "Browse Curtains",
    link: "/gallery?category=curtains",
  },
];

const HeroSlider = () => {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[60vh] overflow-hidden md:h-[75vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            width={1920}
            height={1080}
            fetchPriority={current === 0 ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4 font-display text-4xl text-primary-foreground md:text-6xl lg:text-7xl">
              {lang === "ar" ? slide.titleAr : slide.titleEn}
            </h1>
            <p className="mb-8 max-w-lg mx-auto font-body text-lg text-primary-foreground/80 md:text-xl">
              {lang === "ar" ? slide.subtitleAr : slide.subtitleEn}
            </p>
            <a
              href={slide.link}
              className="gradient-teal inline-block rounded-lg px-10 py-3.5 font-body text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {lang === "ar" ? slide.ctaAr : slide.ctaEn}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute top-1/2 start-4 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-background/50"
        aria-label="Previous"
      >
        <ChevronRight className="h-6 w-6 rtl:rotate-180" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 end-4 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-background/50"
        aria-label="Next"
      >
        <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${i === current ? "w-8 bg-primary-foreground" : "w-2.5 bg-primary-foreground/40"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
