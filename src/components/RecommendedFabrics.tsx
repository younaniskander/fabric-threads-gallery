import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useFabrics } from "@/hooks/useFabrics";
import { useLanguage } from "@/contexts/LanguageContext";
import { useModules } from "@/hooks/useModules";
import FabricCard from "@/components/FabricCard";
import type { Fabric } from "@/data/fabrics";

interface Props {
  currentId?: string;
  category?: string;
  brand?: string;
  limit?: number;
  title?: string;
}

/**
 * Smart recommendation engine (client-side scoring): prioritises same
 * category/brand, then featured/popular/new, then offers.
 */
const RecommendedFabrics = ({ currentId, category, brand, limit = 4, title }: Props) => {
  const fabrics = useFabrics();
  const { lang } = useLanguage();
  const { isEnabled } = useModules();

  const recommended = useMemo(() => {
    const score = (f: Fabric) => {
      let s = 0;
      if (category && f.category === category) s += 5;
      if (brand && f.brand === brand) s += 3;
      if (f.isPopular) s += 2;
      if (f.isFeatured) s += 2;
      if (f.hasOffer) s += 2;
      if (f.isNew) s += 1;
      s += Math.random(); // light shuffle for variety
      return s;
    };
    return [...fabrics]
      .filter((f) => f.id !== currentId && !f.comingSoon)
      .sort((a, b) => score(b) - score(a))
      .slice(0, limit);
  }, [fabrics, currentId, category, brand, limit]);

  if (recommended.length === 0 || !isEnabled("recommendations")) return null;

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-primary" size={20} />
        <h2 className="font-display text-xl md:text-2xl text-foreground">
          {title || (lang === "ar" ? "مقترحات تناسبك" : "Recommended for you")}
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {recommended.map((f) => (
          <FabricCard key={f.id} fabric={f} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedFabrics;