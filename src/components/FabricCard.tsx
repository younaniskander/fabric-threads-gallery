import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Tag } from "lucide-react";
import type { Fabric } from "@/data/fabrics";
import { useLanguage } from "@/contexts/LanguageContext";

interface FabricCardProps {
  fabric: Fabric;
}

const FabricCard = ({ fabric }: FabricCardProps) => {
  const { lang } = useLanguage();

  return (
    <Link to={`/fabric/${fabric.id}`}>
      <motion.div
        className="group relative rounded-lg overflow-hidden shadow-fabric hover:shadow-fabric-hover transition-shadow duration-300 bg-card"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={fabric.image}
            alt={fabric.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {fabric.hasOffer && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded font-body font-semibold flex items-center gap-1">
                <Tag size={10} />
                {fabric.offerText || (lang === "ar" ? "عرض" : "Offer")}
              </span>
            )}
            {fabric.isFeatured && (
              <span className="bg-gold text-gold-foreground text-xs px-2 py-1 rounded font-body font-semibold">
                {lang === "ar" ? "مميز" : "Featured"}
              </span>
            )}
            {fabric.isNew && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-body font-semibold">
                {lang === "ar" ? "جديد" : "New"}
              </span>
            )}
            {fabric.comingSoon && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded font-body font-semibold">
                {lang === "ar" ? "قريباً" : "Soon"}
              </span>
            )}
          </div>
          {/* Category tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded font-body">
              {fabric.category === "upholstery" ? (lang === "ar" ? "تنجيد" : "Upholstery") : (lang === "ar" ? "ستائر" : "Curtains")}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display text-lg text-foreground mb-1">{fabric.name}</h3>
          <p className="text-xs text-muted-foreground font-body mb-2">{fabric.brand} • {fabric.origin}</p>
          {fabric.price && (
            <p className="text-sm font-body font-semibold text-primary mb-2">{fabric.price}</p>
          )}
          <div className="flex items-center gap-1.5 mb-3">
            {fabric.colorVariants?.slice(0, 5).map((variant, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: variant.color }}
                title={variant.name}
              />
            ))}
          </div>
          {fabric.inAllBranches && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
              <MapPin size={12} className="text-primary" />
              {lang === "ar" ? "متاح في كل الفروع" : "Available in all branches"}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default FabricCard;

