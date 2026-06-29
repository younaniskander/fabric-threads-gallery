import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ShoppingBag, Plus, Minus } from "lucide-react";
import { fabricTypes, brands } from "@/data/fabrics";
import { useFabrics } from "@/hooks/useFabrics";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewsSection from "@/components/ReviewsSection";
import ProductImageViewer from "@/components/ProductImageViewer";
import RecommendedFabrics from "@/components/RecommendedFabrics";
import Seo from "@/components/Seo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { toast } from "sonner";


const FabricDetail = () => {
  const { id } = useParams();
  const fabrics = useFabrics();
  const fabric = fabrics.find((f) => f.id === id);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { lang } = useLanguage();

  // Build a de-duplicated gallery from the main image + any color-variant images.
  const galleryImages = useMemo(() => {
    if (!fabric) return [];
    const imgs = [
      fabric.image,
      ...(fabric.colorVariants?.map((v) => v.image).filter(Boolean) as string[]),
    ];
    return Array.from(new Set(imgs.filter(Boolean)));
  }, [fabric]);

  const [activeImage, setActiveImage] = useState(0);

  // When the user picks a color whose variant has its own image, sync the viewer.
  useEffect(() => {
    if (!fabric) return;
    const variantImage = fabric.colorVariants?.[selectedColor]?.image;
    if (variantImage) {
      const idx = galleryImages.indexOf(variantImage);
      if (idx >= 0) setActiveImage(idx);
    }
  }, [selectedColor, fabric, galleryImages]);

  if (!fabric) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">القماش غير موجود</h1>
          <Link to="/gallery" className="text-primary font-body text-sm hover:underline">العودة للمعرض</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const typeName = fabricTypes.find((t) => t.id === fabric.type)?.name || fabric.type;
  const brandName = brands.find((b) => b.id === fabric.brand)?.name || fabric.brand;
  const currentVariant = fabric.colorVariants?.[selectedColor];
  const displayImage = galleryImages[activeImage] || currentVariant?.image || fabric.image;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${fabric.name} | آدم للأقمشة`}
        description={`${fabric.name} من ${brandName}${fabric.origin ? ` - ${fabric.origin}` : ""}. ${fabric.composition || "قماش فاخر"} متوفر لدى آدم للأقمشة.`.slice(0, 160)}
        path={`/fabric/${fabric.id}`}
        type="product"
        image={displayImage?.startsWith("http") ? displayImage : undefined}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ArrowRight size={14} className="rotate-180" />
          <Link to="/gallery" className="hover:text-primary">المعرض</Link>
          <ArrowRight size={14} className="rotate-180" />
          <span className="text-foreground">{fabric.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ProductImageViewer
              images={galleryImages}
              index={activeImage}
              onIndexChange={setActiveImage}
              alt={`${fabric.name}${currentVariant?.name ? ` - ${currentVariant.name}` : ""}`}
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-2 mb-4 flex-wrap">
              {fabric.hasOffer && (
                <span className="bg-destructive text-destructive-foreground text-xs px-3 py-1 rounded-full font-body font-semibold">
                  {fabric.offerText || (lang === "ar" ? "عرض خاص" : "Special Offer")}
                </span>
              )}
              {fabric.isFeatured && (
                <span className="bg-gold text-gold-foreground text-xs px-3 py-1 rounded-full font-body font-semibold">مميز</span>
              )}
              {fabric.isNew && (
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-body font-semibold">جديد</span>
              )}
              {fabric.inAllBranches && (
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-body font-semibold">
                  {lang === "ar" ? "متاح في كل الفروع" : "In all branches"}
                </span>
              )}
            </div>


            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">{fabric.name}</h1>
            <p className="text-muted-foreground font-body text-sm mb-4">{fabric.nameEn}</p>
            {fabric.price && (
              <p className="font-display text-2xl text-primary mb-6">{fabric.price}</p>
            )}

            {/* Specs */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <h2 className="font-display text-lg text-foreground mb-4">المواصفات</h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm font-body">
                <SpecRow label="النوع" value={typeName} />
                <SpecRow label="الماركة" value={brandName} />
                <SpecRow label="التصنيف" value={fabric.category === "upholstery" ? "قماش تنجيد" : "مقاس ستائر"} />
                <SpecRow label="المنشأ" value={fabric.origin} />
                <SpecRow label="التركيب" value={fabric.composition} />
                
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h2 className="font-display text-lg text-foreground mb-3">المميزات</h2>
              <div className="flex flex-wrap gap-2">
                {fabric.features.map((f, i) => (
                  <span key={i} className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full font-body">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Usage */}
            <div className="mb-6">
              <h2 className="font-display text-lg text-foreground mb-3">الاستخدامات</h2>
              <div className="flex flex-wrap gap-2">
                {fabric.usage.map((u, i) => (
                  <span key={i} className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-body">
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* Color variant selector */}
            <div className="mb-8 space-y-2">
              <span className="text-xs text-muted-foreground font-body">اختر اللون:</span>
              <div className="flex items-center gap-3 flex-wrap">
                {fabric.colorVariants?.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-body ${
                      selectedColor === i
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: variant.color }}
                    />
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <span className="text-xs text-muted-foreground font-body mb-2 block">
                {lang === "ar" ? "الكمية:" : "Quantity:"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-body font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Price removed — products are display-only */}


            {/* CTA */}
            <div className="flex gap-3">
              {/* Add to Cart */}
              <button
                onClick={() => {
                  addItem({
                    id: fabric.id,
                    name: fabric.name,
                    nameEn: fabric.nameEn,
                    image: displayImage,
                    price: fabric.priceNum ?? 0,
                    priceDisplay: fabric.price ?? "",
                    color: currentVariant?.color,
                    colorName: currentVariant?.name,
                  }, quantity);
                  toast.success(lang === "ar" ? "تمت الإضافة للسلة" : "Added to cart", { duration: 3000 });
                }}

                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-body font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
              </button>
              <a
                href={buildWhatsAppLink(
                  lang === "ar"
                    ? `مرحبًا، أريد الاستفسار عن قماش "${fabric.name}" من آدم للقماش.`
                    : `Hello, I'd like to inquire about "${fabric.nameEn}" fabric from ADAM Fabrics.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-teal text-primary-foreground py-3 px-6 rounded-lg font-body font-semibold text-center text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                {lang === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
              </a>
            </div>

            {/* Mascot tip */}
            <div className="mt-6 bg-muted rounded-xl p-4 flex items-center gap-4 flex-row-reverse">
              <p className="text-xs font-body text-muted-foreground text-right">
                💡 هذا القماش مثالي لـ{fabric.usage[0]}! تواصل معنا لمزيد من التفاصيل.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <ReviewsSection fabricId={fabric.id} />

        {/* Smart recommendations */}
        <RecommendedFabrics currentId={fabric.id} category={fabric.category} brand={fabric.brand} />
      </div>

      <Footer />
    </div>
  );
};

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium">{value}</span>
  </>
);

export default FabricDetail;
