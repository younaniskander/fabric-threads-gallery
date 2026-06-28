import { useLanguage } from "@/contexts/LanguageContext";
import { Truck, Tag, Clock, MessageCircle, Sparkles } from "lucide-react";

const PromoBanner = () => {
  const { lang } = useLanguage();

  const items =
    lang === "ar"
      ? [
          { icon: Truck, text: "شحن مجاني للطلبات فوق 2000 جنيه" },
          { icon: Tag, text: "خصومات موسمية تصل إلى 25%" },
          { icon: Clock, text: "عروض لفترة محدودة على المخمل الفاخر" },
          { icon: Sparkles, text: "وصل حديثاً: أحدث تشكيلات الأقمشة" },
          { icon: MessageCircle, text: "استفسر عبر واتساب عن تشكيلاتنا" },
        ]
      : [
          { icon: Truck, text: "Free shipping on orders over 2000 EGP" },
          { icon: Tag, text: "Seasonal discounts up to 25%" },
          { icon: Clock, text: "Limited-time offers on premium velvet" },
          { icon: Sparkles, text: "New arrivals: latest fabric collections" },
          { icon: MessageCircle, text: "Ask on WhatsApp about our collections" },
        ];

  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden bg-primary py-3 text-primary-foreground">
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
        {loop.map((item, i) => {
          const Icon = item.icon;
          return (
            <span key={i} className="flex items-center gap-2 font-body text-sm">
              <Icon size={16} />
              {item.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default PromoBanner;