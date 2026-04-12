import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { fabrics } from "@/data/fabrics";
import FabricCard from "@/components/FabricCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";
import BrandMarquee from "@/components/BrandMarquee";
import HeroSlider from "@/components/HeroSlider";
import CategoryCircles from "@/components/CategoryCircles";
import FeaturesBar from "@/components/FeaturesBar";
import CollectionBanners from "@/components/CollectionBanners";
import SectionHeader from "@/components/SectionHeader";
import UpholsteryIntro from "@/components/UpholsteryIntro";
import StickyScrollFabrics from "@/components/StickyScrollFabrics";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const { t } = useLanguage();
  const featured = fabrics.filter((f) => f.isFeatured);
  const newArrivals = fabrics.filter((f) => f.isNew);
  const popular = fabrics.filter((f) => f.isPopular);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSlider />

      {/* Shop by Category */}
      <CategoryCircles />

      {/* Sticky Scroll Fabrics Showcase */}
      <StickyScrollFabrics />

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <SectionHeader title={t("section.featured")} />
          <Link
            to="/gallery"
            className="hidden md:inline-block rounded-lg border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {t("section.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
      </section>

      {/* Tip section */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-row-reverse items-center gap-6 rounded-xl bg-muted p-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-start">
            <h3 className="mb-2 font-display text-xl text-foreground">
              💡 {t("misc.adam")}
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              {useLanguage().lang === "ar"
                ? "هل تعلم أن القطن المصري يُعتبر من أفخر أنواع القطن في العالم؟ يتميز بأليافه الطويلة التي تمنحه نعومة ومتانة استثنائية."
                : "Did you know that Egyptian cotton is considered one of the finest in the world? Its long fibers give it exceptional softness and durability."}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Brand partners */}
      <section className="container mx-auto px-4 py-16">
        <BrandMarquee />
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <SectionHeader title={t("section.newArrivals")} />
          <Link
            to="/gallery"
            className="hidden md:inline-block rounded-lg border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {t("section.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newArrivals.map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
      </section>

      {/* Upholstery Intro */}
      <UpholsteryIntro />

      {/* Collections */}
      <CollectionBanners />

      {/* Popular */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <SectionHeader title={t("section.popular")} />
          <Link
            to="/gallery"
            className="hidden md:inline-block rounded-lg border border-border px-6 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {t("section.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Features bar */}
      <FeaturesBar />

      <Footer />
      <FloatingChat />
    </div>
  );
};

export default Index;
