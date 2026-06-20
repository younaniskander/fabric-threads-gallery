import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChevronDown, ShoppingBag, User, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import GlassThemeToggle from "@/components/GlassThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { defaultWhatsAppLink, WHATSAPP_NUMBER_LOCAL } from "@/lib/whatsapp";
import adamLogoLight from "@/assets/adam-logo-new.png";
import adamLogoDark from "@/assets/adam-logo-new-white.png";

const platformLabels: Record<string, Record<string, string>> = {
  facebook: { ar: "فيسبوك", en: "Facebook" },
  tiktok: { ar: "تيك توك", en: "TikTok" },
  instagram: { ar: "انستجرام", en: "Instagram" },
  twitter: { ar: "تويتر", en: "Twitter" },
  youtube: { ar: "يوتيوب", en: "YouTube" },
  snapchat: { ar: "سناب شات", en: "Snapchat" },
  whatsapp: { ar: "واتساب", en: "WhatsApp" },
};

const platformIcons: Record<string, string> = {
  facebook: "📘", tiktok: "🎵", instagram: "📸", twitter: "🐦",
  youtube: "🎥", snapchat: "👻", whatsapp: "💬",
};

type SocialLink = { id: string; platform: string; url: string; is_active: boolean };

const productCategories = [
  { slug: "upholstery", ar: "التنجيد", en: "Upholstery" },
  { slug: "velvet", ar: "المخمل", en: "Velvet" },
  { slug: "print", ar: "المطبوع", en: "Print" },
  { slug: "drapes", ar: "الستائر", en: "Drapes" },
  { slug: "embroidery", ar: "المطرز", en: "Embroidery" },
  { slug: "like-leather", ar: "شبه الجلد", en: "Like-Leather Fabric" },
  { slug: "plain", ar: "السادة", en: "Plain" },
  { slug: "hotels", ar: "الفندقية", en: "Hotels" },
  { slug: "ready-made-curtains", ar: "ستائر جاهزة", en: "Ready-made Curtains" },
];

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    supabase.from("social_links").select("*").then(({ data }) => {
      if (data) setSocialLinks(data);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node)) setContactDropdownOpen(false);
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(e.target as Node)) setProductsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLinks = socialLinks.filter((l) => l.is_active && l.url);
  const soonLinks = socialLinks.filter((l) => !l.is_active || !l.url);
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.about"), path: "/about" },
    { label: t("nav.gallery"), path: "/gallery" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex h-14 items-center justify-between md:h-20">
          {/* Left: Logo + actions */}
          <div className="flex items-center gap-1.5 md:gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <img src={theme === "dark" ? adamLogoDark : adamLogoLight} alt="ADAM Fabrics" className="h-9 md:h-16 w-auto object-contain" />
            </Link>

            <div className="hidden sm:block">
              <GlassThemeToggle />
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1 md:px-2.5 md:py-1.5 text-[10px] md:text-xs font-body text-muted-foreground transition-colors hover:text-primary hover:border-primary"
            >
              <Globe size={12} />
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 md:p-2 text-muted-foreground transition-colors hover:text-primary"
              aria-label={t("nav.search")}
            >
              <Search size={18} />
            </button>

            {/* WhatsApp quick link */}
            <a
              href={defaultWhatsAppLink(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[#25D366] transition-colors hover:opacity-80"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.515 5.26l-.999 3.648 3.74-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
              </svg>
              <span dir="ltr" className="hidden text-xs font-body lg:inline">{WHATSAPP_NUMBER_LOCAL}</span>
            </a>
          </div>

          {/* Right nav + actions */}
          <div className="flex items-center gap-0.5 md:gap-3">
            {/* Desktop nav */}
            <div className="hidden items-center gap-6 font-body text-sm md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors duration-200 hover:text-primary ${
                    isActive(item.path) ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Products dropdown */}
              <div className="relative" ref={productsDropdownRef}>
                <button
                  onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                  className={`flex items-center gap-1 transition-colors hover:text-primary ${
                    location.pathname.startsWith("/category") ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {lang === "ar" ? "المنتجات" : "Products"}
                  <ChevronDown size={14} className={`transition-transform ${productsDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {productsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute end-0 top-full mt-2 w-52 rounded-xl border border-border bg-card p-2 shadow-lg"
                    >
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          onClick={() => setProductsDropdownOpen(false)}
                          className={`block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted ${
                            location.pathname === `/category/${cat.slug}` ? "text-primary font-semibold bg-muted" : "text-foreground"
                          }`}
                        >
                          {lang === "ar" ? cat.ar : cat.en}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Us button */}
              <button
                onClick={scrollToContact}
                className="rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-body text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("nav.contact")}
              </button>

              {/* Social dropdown */}
              <div className="relative" ref={contactDropdownRef}>
                <button
                  onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
                >
                  <ChevronDown size={14} className={`transition-transform ${contactDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {contactDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute end-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lg"
                    >
                      {activeLinks.map((link) => (
                        <a
                          key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                          onClick={() => setContactDropdownOpen(false)}
                        >
                          <span>{platformIcons[link.platform] || "🔗"}</span>
                          {platformLabels[link.platform]?.[lang] || link.platform}
                        </a>
                      ))}
                      {soonLinks.map((link) => (
                        <div key={link.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-default">
                          <span>{platformIcons[link.platform] || "🔗"}</span>
                          {platformLabels[link.platform]?.[lang] || link.platform}
                          <span className="ms-auto text-xs bg-muted px-1.5 py-0.5 rounded">{lang === "ar" ? "قريباً" : "Soon"}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* User */}
            <Link
              to={user ? "/profile" : "/auth"}
              className="hidden p-2 text-muted-foreground transition-colors hover:text-primary md:block"
              aria-label={t("nav.signIn")}
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative p-1.5 md:p-2 text-muted-foreground transition-colors hover:text-primary" aria-label={t("nav.cart")}>
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 md:p-2 text-foreground md:hidden" aria-label="Menu">
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-background"
          >
            <div className="container mx-auto flex items-center gap-3 px-4 py-3">
              <Search size={18} className="text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.currentTarget.value.trim();
                    if (target) window.location.href = `/gallery?search=${encodeURIComponent(target)}`;
                  }
                }}
              />
              <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-background md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path} to={item.path} onClick={() => setIsOpen(false)}
                  className={`py-2 text-sm ${isActive(item.path) ? "text-primary font-semibold" : "text-muted-foreground"}`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Products section */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">{lang === "ar" ? "المنتجات" : "Products"}</p>
                {productCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 text-sm ${
                      location.pathname === `/category/${cat.slug}` ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {lang === "ar" ? cat.ar : cat.en}
                  </Link>
                ))}
              </div>

              <Link to={user ? "/profile" : "/auth"} onClick={() => setIsOpen(false)} className="py-2 text-sm text-muted-foreground">
                {user ? (lang === "ar" ? "حسابي" : "My Account") : t("nav.signIn")}
              </Link>

              {/* Mobile contact button */}
              <button
                onClick={scrollToContact}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-body text-primary-foreground text-center"
              >
                {t("nav.contact")}
              </button>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">{lang === "ar" ? "تابعنا" : "Follow Us"}</p>
                {activeLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm text-foreground"
                  >
                    <span>{platformIcons[link.platform] || "🔗"}</span>
                    {platformLabels[link.platform]?.[lang] || link.platform}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
