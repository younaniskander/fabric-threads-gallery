import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import adamLogoDark from "@/assets/adam-logo-dark.png";

const Footer = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="mt-16 bg-foreground py-12 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-start">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <img src={adamLogoDark} alt="ADAM Fabrics" className="h-16 object-contain" />
            <p className="max-w-xs font-body text-sm opacity-70">
              {t("footer.about")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display text-lg text-gold">{t("footer.quickLinks")}</h4>
            <div className="flex flex-col gap-2 font-body text-sm opacity-70">
              <Link to="/" className="transition-opacity hover:opacity-100">{t("nav.home")}</Link>
              <Link to="/about" className="transition-opacity hover:opacity-100">{t("nav.about")}</Link>
              <Link to="/gallery" className="transition-opacity hover:opacity-100">{t("nav.gallery")}</Link>
              <Link to="/auth" className="transition-opacity hover:opacity-100">{lang === "ar" ? "حسابي" : "My Account"}</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 font-display text-lg text-gold">{t("footer.categories")}</h4>
            <div className="flex flex-col gap-2 font-body text-sm opacity-70">
              <Link to="/gallery?category=upholstery" className="transition-opacity hover:opacity-100">{t("cat.upholstery")}</Link>
              <Link to="/gallery?category=curtains" className="transition-opacity hover:opacity-100">{t("cat.curtains")}</Link>
              <Link to="/gallery?type=velvet" className="transition-opacity hover:opacity-100">{t("cat.velvet")}</Link>
              <Link to="/gallery?type=cotton" className="transition-opacity hover:opacity-100">{t("cat.cotton")}</Link>
              <Link to="/gallery?type=silk" className="transition-opacity hover:opacity-100">{t("cat.silk")}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display text-lg text-gold">{t("footer.contactUs")}</h4>
            <div className="flex flex-col gap-2 font-body text-sm opacity-70">
              <span>📞 +20 100 000 0000</span>
              <span>✉️ info@adamfabrics.com</span>
              <span>📍 {lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center font-body text-xs opacity-50">
          © {new Date().getFullYear()} ADAM Fabrics. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
