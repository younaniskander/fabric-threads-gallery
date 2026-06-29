import { useLanguage } from "@/contexts/LanguageContext";
import { Truck, Tag, Clock, MessageCircle, Sparkles } from "lucide-react";

const PromoBanner = () => {
  const { lang } = useLanguage();

  const items =
    lang === "ar"
      ? [
          { icon: Tag, text: "عروض وخصومات جديدة باستمرار" },
          { icon: Clock, text: "عروض لفترة محدودة على المخمل الفاخر" },
          { icon: Sparkles, text: "وصل حديثاً: أحدث تشكيلات الأقمشة" },
          { icon: MessageCircle, text: "اطلب وتواصل معنا مباشرة عبر واتساب" },
        ]
      : [
          { icon: Tag, text: "New offers & discounts all the time" },
          { icon: Clock, text: "Limited-time offers on premium velvet" },
          { icon: Sparkles, text: "New arrivals: latest fabric collections" },
          { icon: MessageCircle, text: "Order & chat with us directly on WhatsApp" },
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