export interface FabricColorVariant {
  name: string;
  color: string;
  image?: string;
}

export interface Fabric {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  category: "upholstery" | "curtains";
  brand: string;
  image: string;
  colorVariants: FabricColorVariant[];
  colors: string[];
  gsm: number;
  origin: string;
  composition: string;
  features: string[];
  usage: string[];
  price?: string;
  priceNum?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  comingSoon?: boolean;
  hasOffer?: boolean;
  offerText?: string;
  inAllBranches?: boolean;
}

export const fabricTypes = [
  { id: "cotton", name: "قطن", nameEn: "Cotton" },
  { id: "linen", name: "كتان", nameEn: "Linen" },
  { id: "polyester", name: "بوليستر", nameEn: "Polyester" },
  { id: "silk", name: "حرير", nameEn: "Silk" },
  { id: "velvet", name: "مخمل", nameEn: "Velvet" },
  { id: "satin", name: "ساتان", nameEn: "Satin" },
  { id: "chiffon", name: "شيفون", nameEn: "Chiffon" },
  { id: "denim", name: "دنيم", nameEn: "Denim" },
];

export const brands = [
  { id: "adam-premium", name: "آدم بريميوم" },
  { id: "silk-road", name: "طريق الحرير" },
  { id: "cotton-club", name: "نادي القطن" },
  { id: "royal-textiles", name: "رويال تكستايل" },
  { id: "orient-fabrics", name: "أقمشة الشرق" },
];

export const origins = [
  "مصر", "الهند", "الصين", "تركيا", "إيطاليا", "اليابان", "المغرب"
];

// No static/demo fabrics — admin adds real products from the dashboard.
export const fabrics: Fabric[] = [];
