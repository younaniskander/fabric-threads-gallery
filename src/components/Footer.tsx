import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import adamLogoLight from "@/assets/adam-logo-new.png";
import adamLogoDark from "@/assets/adam-logo-new.png";

const Footer = () => {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className="mt-16 border-t border-border bg-background py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Logo */}
          <div className="flex items-start justify-center md:justify-start">
            <img
              src={theme === "dark" ? adamLogoDark : adamLogoLight}
              alt="ADAM Fabrics"
              className="h-20 object-contain"
            />
          </div>

          {/* Categories */}
          <div className="text-center md:text-start">
            <h4 className="mb-5 font-display text-xl font-semibold text-foreground">
              {t("footer.categories")}
            </h4>
            <div className="flex flex-col gap-3 font-body text-base text-muted-foreground">
              <Link to="/gallery?category=upholstery" className="transition-colors hover:text-foreground">
                {t("cat.upholstery")}
              </Link>
              <Link to="/gallery?category=curtains" className="transition-colors hover:text-foreground">
                {t("cat.curtains")}
              </Link>
              <Link to="/gallery?type=velvet" className="transition-colors hover:text-foreground">
                {t("cat.velvet")}
              </Link>
              <Link to="/gallery?type=cotton" className="transition-colors hover:text-foreground">
                {t("cat.cotton")}
              </Link>
              <Link to="/gallery?type=silk" className="transition-colors hover:text-foreground">
                {t("cat.silk")}
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-start">
            <h4 className="mb-5 font-display text-xl font-semibold text-foreground">
              {t("footer.quickLinks")}
            </h4>
            <div className="flex flex-col gap-3 font-body text-base text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                {t("nav.home")}
              </Link>
              <Link to="/about" className="transition-colors hover:text-foreground">
                {t("nav.about")}
              </Link>
              <Link to="/gallery" className="transition-colors hover:text-foreground">
                {t("nav.gallery")}
              </Link>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                {lang === "ar" ? "حسابي" : "My Account"}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-start">
            <h4 className="mb-5 font-display text-xl font-semibold text-foreground">
              {t("footer.contactUs")}
            </h4>
            <div className="flex flex-col gap-3 font-body text-base text-muted-foreground">
              <span>📞 +20 100 000 0000</span>
              <span>✉️ info@adamfabrics.com</span>
              <span>📍 {lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center font-body text-sm text-muted-foreground">
          © {new Date().getFullYear()} ADAM Fabrics. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
