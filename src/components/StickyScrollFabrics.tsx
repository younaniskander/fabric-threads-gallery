import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

import swatchVelvet from "@/assets/swatch-velvet.jpg";
import swatchCotton from "@/assets/swatch-cotton.jpg";
import swatchSilk from "@/assets/swatch-silk.jpg";
import swatchLinen from "@/assets/swatch-linen.jpg";
import swatchSatin from "@/assets/swatch-satin.jpg";
import swatchDenim from "@/assets/swatch-denim.jpg";
import swatchPolyester from "@/assets/swatch-polyester.jpg";
import swatchVelvet2 from "@/assets/swatch-velvet-2.jpg";
import swatchCotton2 from "@/assets/swatch-cotton-2.jpg";

interface FabricSlide {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  descAr: string;
  descEn: string;
  price: string;
  image: string;
}

const slides: FabricSlide[] = [
  {
    id: "1",
    nameAr: "مخمل ملكي",
    nameEn: "Royal Velvet",
    categoryAr: "تنجيد",
    categoryEn: "Upholstery",
    descAr: "قماش مخمل فاخر بملمس ناعم وألوان غنية، مثالي للأنتريهات والكنب الكلاسيكي.",
    descEn: "Luxurious velvet with a soft touch and rich colors, perfect for classic sofas and armchairs.",
    price: "٤٥٠ ج.م/متر",
    image: swatchVelvet,
  },
  {
    id: "2",
    nameAr: "قطن مصري",
    nameEn: "Egyptian Cotton",
    categoryAr: "تنجيد",
    categoryEn: "Upholstery",
    descAr: "قطن مصري فائق الجودة، متين وسهل التنظيف، مثالي للاستخدام اليومي.",
    descEn: "Premium Egyptian cotton, durable and easy to clean, ideal for daily use.",
    price: "٣٢٠ ج.م/متر",
    image: swatchCotton,
  },
  {
    id: "3",
    nameAr: "حرير فاخر",
    nameEn: "Luxury Silk",
    categoryAr: "ستائر",
    categoryEn: "Curtains",
    descAr: "حرير طبيعي لامع وانسيابي، يضفي أناقة استثنائية على ستائر الصالون.",
    descEn: "Shimmering natural silk with elegant drape, adding exceptional grace to salon curtains.",
    price: "٥٨٠ ج.م/متر",
    image: swatchSilk,
  },
  {
    id: "4",
    nameAr: "كتان طبيعي",
    nameEn: "Natural Linen",
    categoryAr: "تنجيد",
    categoryEn: "Upholstery",
    descAr: "كتان طبيعي صديق للبيئة يزداد نعومة مع الاستخدام، تصميم عصري ومتين.",
    descEn: "Eco-friendly natural linen that softens with use, modern design and durable.",
    price: "٣٨٠ ج.م/متر",
    image: swatchLinen,
  },
  {
    id: "5",
    nameAr: "ساتان ملكي",
    nameEn: "Royal Satin",
    categoryAr: "ستائر",
    categoryEn: "Curtains",
    descAr: "ساتان لامع ناعم مقاوم للتجاعيد، يحجب الضوء بشكل مثالي لغرف النوم.",
    descEn: "Smooth glossy satin, wrinkle-resistant and perfect blackout for bedrooms.",
    price: "٤٢٠ ج.م/متر",
    image: swatchSatin,
  },
  {
    id: "6",
    nameAr: "دنيم عملي",
    nameEn: "Practical Denim",
    categoryAr: "تنجيد",
    categoryEn: "Upholstery",
    descAr: "قماش دنيم متين ومرن، مثالي للكنب العائلي وكراسي المكتب.",
    descEn: "Sturdy and flexible denim fabric, ideal for family sofas and office chairs.",
    price: "٢٨٠ ج.م/متر",
    image: swatchDenim,
  },
  {
    id: "7",
    nameAr: "بوليستر خفيف",
    nameEn: "Light Polyester",
    categoryAr: "ستائر",
    categoryEn: "Curtains",
    descAr: "قماش بوليستر خفيف واقتصادي، مثالي لستائر المطبخ والشرفة.",
    descEn: "Lightweight and affordable polyester, perfect for kitchen and balcony curtains.",
    price: "١٨٠ ج.م/متر",
    image: swatchPolyester,
  },
  {
    id: "8",
    nameAr: "مخمل زمردي",
    nameEn: "Emerald Velvet",
    categoryAr: "تنجيد",
    categoryEn: "Upholstery",
    descAr: "مخمل بلون أخضر زمردي فاخر، يمنح المساحات لمسة ملكية فريدة.",
    descEn: "Luxurious emerald green velvet, giving spaces a unique royal touch.",
    price: "٤٨٠ ج.م/متر",
    image: swatchVelvet2,
  },
  {
    id: "9",
    nameAr: "قطن تيراكوتا",
    nameEn: "Terracotta Cotton",
    categoryAr: "تنجيد",
    categoryEn: "Upholstery",
    descAr: "قطن بلون تيراكوتا دافئ، مثالي للديكورات العصرية والبوهيمية.",
    descEn: "Warm terracotta cotton, perfect for modern and bohemian décor.",
    price: "٣٤٠ ج.م/متر",
    image: swatchCotton2,
  },
];

const SECTION_HEIGHT = 2400;
const STEP_COUNT = slides.length;

const StickyScrollFabrics = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = -rect.top;
      const scrollableHeight = SECTION_HEIGHT - window.innerHeight;
      const rawProgress = Math.max(0, Math.min(1, sectionTop / scrollableHeight));
      setProgress(rawProgress);
      const stepIndex = Math.min(
        STEP_COUNT - 1,
        Math.floor(rawProgress * STEP_COUNT)
      );
      setActiveIndex(stepIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentSlide = slides[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${SECTION_HEIGHT}px` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        {/* Main content split */}
        <div className="flex h-full w-full flex-col md:flex-row">
          {/* Left: Swatch image */}
          <div className="relative h-1/2 w-full overflow-hidden md:h-full md:w-1/2">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transform: i === activeIndex ? "scale(1)" : "scale(1.08)",
                }}
              >
                <img
                  src={slide.image}
                  alt={isAr ? slide.nameAr : slide.nameEn}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  width={800}
                  height={800}
                />
              </div>
            ))}
            {/* Overlay gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-background/20 dark:to-background/40" />
          </div>

          {/* Right: Text content */}
          <div className="relative flex h-1/2 w-full flex-col items-start justify-center px-8 md:h-full md:w-1/2 md:px-16">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 transition-all duration-600 ease-out"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transform:
                    i === activeIndex
                      ? "translateY(0px)"
                      : "translateY(28px)",
                  pointerEvents: i === activeIndex ? "auto" : "none",
                }}
              >
                {/* Category badge */}
                <span className="mb-3 inline-block w-fit rounded-full border border-border bg-muted px-4 py-1.5 font-body text-xs uppercase tracking-widest text-muted-foreground">
                  {isAr ? slide.categoryAr : slide.categoryEn}
                </span>

                {/* Name */}
                <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl lg:text-6xl">
                  {isAr ? slide.nameAr : slide.nameEn}
                </h2>

                {/* Description */}
                <p className="mb-6 max-w-md font-body text-base leading-relaxed text-muted-foreground md:text-lg">
                  {isAr ? slide.descAr : slide.descEn}
                </p>

                {/* Price */}
                <div className="mb-8 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-primary md:text-3xl">
                    {slide.price}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  to={`/fabric/${slide.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {isAr ? "عرض التفاصيل" : "View Details"}
                  <span className={isAr ? "rotate-180" : ""}>→</span>
                </Link>
              </div>
            ))}

            {/* Dot progress indicator (right edge) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 md:right-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!sectionRef.current) return;
                    const sectionTop =
                      sectionRef.current.getBoundingClientRect().top +
                      window.scrollY;
                    const scrollableHeight = SECTION_HEIGHT - window.innerHeight;
                    const targetScroll =
                      sectionTop + (i / STEP_COUNT) * scrollableHeight;
                    window.scrollTo({ top: targetScroll, behavior: "smooth" });
                  }}
                  className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                    i === activeIndex
                      ? "scale-125 border-primary bg-primary"
                      : "border-muted-foreground/40 bg-transparent hover:border-primary/60"
                  }`}
                  aria-label={`Go to fabric ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step counter */}
        <div className="absolute bottom-16 left-8 font-body text-xs text-muted-foreground md:left-16">
          <span className="font-display text-lg font-bold text-foreground">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="mx-1">/</span>
          <span>{String(STEP_COUNT).padStart(2, "0")}</span>
        </div>

        {/* Horizontal progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default StickyScrollFabrics;
