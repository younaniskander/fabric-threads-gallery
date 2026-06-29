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

const SocialIcon = ({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) => {
  switch (platform) {
    case "facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.66 2.58-4.8 2.08-1.72 5.21-1.89 7.52-.55.05.04.08.09.08.16v3.5c-.05.02-.11.03-.16.05-1.23.39-2.62.08-3.35-.92-.32-.46-.46-1.01-.48-1.56-.06-1.17.62-2.27 1.68-2.74.36-.16.74-.26 1.13-.32-.17-.34-.48-.62-.84-.76-.75-.29-1.6-.21-2.31.22-.93.56-1.49 1.55-1.55 2.62-.01.22-.03.44-.01.66.03.6.16 1.19.4 1.74.69 1.49 2.18 2.53 3.8 2.75 1.06.15 2.15-.02 3.11-.5.04-.02.09-.04.13-.06V.02z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "twitter":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "snapchat":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.206 0c.99 0 4.347.276 5.93 3.821.489 1.037.703 2.208.653 3.38-.06 1.39-.395 2.672-1.001 3.808-.14.281-.335.63-.65 1.02-.47.6-.83 1.05-1.04 1.35-.33.51-.47 1.01-.44 1.54.03.7.42 1.27 1.05 1.55.18.08.37.12.57.12.49 0 .97-.2 1.32-.55.31-.3.55-.3.82-.14.27.16.34.45.21.77-.17.4-.6.78-1.21 1.06-.3.13-.62.2-.95.2-.5 0-.98-.14-1.42-.4-.44-.26-.8-.63-1.05-1.08-.28-.5-.74-.75-1.24-.75-.13 0-.26.02-.39.05-.5.13-.92.46-1.14.92-.23.48-.2 1.03.08 1.48.28.45.74.75 1.26.79.15.01.3.03.45.07.39.11.64.36.69.69.06.4-.18.78-.61.97-.35.15-.75.2-1.19.15-.98-.12-1.8-.76-2.14-1.63-.2-.52-.18-1.08.05-1.58.14-.3.22-.6.22-.9 0-.36-.12-.7-.35-.98-.4-.48-.9-.84-1.47-1.05-.49-.18-1.02-.28-1.57-.3-.56-.03-1.1.03-1.63.17-1.08.29-1.92 1.04-2.31 2.05-.19.48-.2.99-.03 1.48.34.96 1.17 1.64 2.18 1.78.46.07.83.33 1.01.72.2.43.1.92-.27 1.28-.24.23-.56.36-.91.36-.15 0-.3-.02-.45-.07-1.17-.35-2.12-1.16-2.6-2.21-.47-1.03-.47-2.21.01-3.24.55-1.18 1.55-2.02 2.77-2.32.66-.17 1.34-.23 2.02-.18.19.01.38.04.57.07.31.05.62-.02.88-.2.26-.18.45-.45.52-.76.14-.57.0-1.15-.36-1.6-.23-.3-.52-.53-.86-.69-.62-.29-1.03-.75-1.18-1.32-.15-.58-.06-1.2.26-1.71.41-.64 1.1-1.04 1.86-1.06.13 0 .26.0.39.01.27.02.53-.05.76-.22.22-.16.37-.4.43-.67.19-.85.68-1.54 1.38-1.93.38-.21.81-.32 1.25-.32.23 0 .46.03.68.09.67.19 1.22.62 1.54 1.19.21.39.3.82.26 1.25-.04.43-.24.83-.55 1.13-.3.29-.47.68-.47 1.1 0 .42.17.81.47 1.1.31.3.51.7.55 1.13.04.43-.05.86-.26 1.25-.32.57-.87 1.0-1.54 1.19-.22.06-.45.09-.68.09-.44 0-.87-.11-1.25-.32-.7-.39-1.19-1.08-1.38-1.93-.06-.27-.21-.51-.43-.67-.23-.17-.49-.24-.76-.22-.13.01-.26.01-.39.01-.76-.02-1.45-.42-1.86-1.06-.32-.51-.41-1.13-.26-1.71.15-.57.56-1.03 1.18-1.32.34-.16.63-.39.86-.69.36-.45.5-1.03.36-1.6-.07-.31-.26-.58-.52-.76-.26-.18-.57-.25-.88-.2-.19.03-.38.06-.57.07-.68.05-1.36-.01-2.02-.18-1.22-.3-2.22-1.14-2.77-2.32-.48-1.03-.48-2.21-.01-3.24.48-1.05 1.43-1.86 2.6-2.21.15-.05.3-.07.45-.07.35 0 .67.13.91.36.37.36.47.85.27 1.28-.18.39-.55.65-1.01.72-1.01.14-1.84.82-2.18 1.78-.17.49-.16 1.0.03 1.48.39 1.01 1.23 1.76 2.31 2.05.53.14 1.07.2 1.63.17.55-.02 1.08-.12 1.57-.3.57-.21 1.07-.57 1.47-1.05.23-.28.35-.62.35-.98 0-.3-.08-.6-.22-.9-.23-.5-.25-1.06-.05-1.58.34-.87 1.16-1.51 2.14-1.63.44-.05.84 0 1.19.15.43.19.67.57.61.97-.05.33-.3.58-.69.69-.15.04-.3.06-.45.07-.52.04-.98.34-1.26.79-.28.45-.31 1.0-.08 1.48.22.46.64.79 1.14.92.13.03.26.05.39.05.5 0 .96-.25 1.24-.75.25-.45.61-.82 1.05-1.08.44-.26.92-.4 1.42-.4.33 0 .65.07.95.2.61.28 1.04.66 1.21 1.06.13.32.06.61-.21.77-.27.16-.51.16-.82-.14-.35-.35-.83-.55-1.32-.55-.2 0-.39.04-.57.12-.63.28-1.02.85-1.05 1.55-.03.53.11 1.03.44 1.54.21.3.57.75 1.04 1.35.315.39.51.739.65 1.02.605 1.136.94 2.418 1.0 3.808.05 1.172-.164 2.343-.653 3.38-1.583 3.545-4.94 3.821-5.93 3.821z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.004 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.955L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
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
                      initial={{ opacity: 0, y: -5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute end-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg"
                    >
                      <p className="px-3 py-1.5 text-xs font-body text-muted-foreground">
                        {lang === "ar" ? "تابعنا على" : "Follow us on"}
                      </p>
                      <div className="grid gap-1">
                        {activeLinks.map((link) => (
                          <a
                            key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                            onClick={() => setContactDropdownOpen(false)}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <SocialIcon platform={link.platform} className="h-4 w-4" />
                            </span>
                            {platformLabels[link.platform]?.[lang] || link.platform}
                          </a>
                        ))}
                        {soonLinks.map((link) => (
                          <div key={link.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground cursor-default">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                              <SocialIcon platform={link.platform} className="h-4 w-4" />
                            </span>
                            <span className="flex-1">{platformLabels[link.platform]?.[lang] || link.platform}</span>
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{lang === "ar" ? "قريباً" : "Soon"}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Notifications */}
            {user && (
              <div className="hidden md:block">
                <NotificationBell />
              </div>
            )}

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
                    className="group flex items-center gap-3 py-2 text-sm text-foreground"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <SocialIcon platform={link.platform} className="h-4 w-4" />
                    </span>
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
