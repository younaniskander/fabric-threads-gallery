import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { fabricTypes, brands, origins } from "@/data/fabrics";
import { useFabrics } from "@/hooks/useFabrics";
import FabricCard from "@/components/FabricCard";
import SectionHeader from "@/components/SectionHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Gallery = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fabrics = useFabrics();
  const filtered = useMemo(() => {
    return fabrics.filter((f) => {
      if (search && !f.name.includes(search) && !f.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedType && f.type !== selectedType) return false;
      if (selectedCategory && f.category !== selectedCategory) return false;
      if (selectedBrand && f.brand !== selectedBrand) return false;
      if (selectedOrigin && f.origin !== selectedOrigin) return false;
      return true;
    });
  }, [fabrics, search, selectedType, selectedCategory, selectedBrand, selectedOrigin]);

  const clearFilters = () => {
    setSearch("");
    setSelectedType("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedOrigin("");
  };

  const hasFilters = search || selectedType || selectedCategory || selectedBrand || selectedOrigin;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <SectionHeader title="معرض الأقمشة" subtitle="تصفح مجموعتنا الكاملة من أقمشة التنجيد والستائر" />

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قماش..."
              className="w-full bg-card border border-border rounded-lg py-2.5 pr-10 pl-4 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
            aria-pressed={showFilters}
            className={`p-2.5 rounded-lg border transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            <SlidersHorizontal size={18} />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} aria-label="Clear filters" className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card rounded-lg p-4 border border-border">
                <FilterSelect label="النوع" value={selectedType} onChange={setSelectedType} options={fabricTypes.map(t => ({ value: t.id, label: t.name }))} />
                <FilterSelect label="التصنيف" value={selectedCategory} onChange={setSelectedCategory} options={[{ value: "upholstery", label: "قماش تنجيد" }, { value: "curtains", label: "مقاس ستائر" }]} />
                <FilterSelect label="الماركة" value={selectedBrand} onChange={setSelectedBrand} options={brands.map(b => ({ value: b.id, label: b.name }))} />
                <FilterSelect label="المنشأ" value={selectedOrigin} onChange={setSelectedOrigin} options={origins.map(o => ({ value: o, label: o }))} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-sm text-muted-foreground font-body mb-6">{filtered.length} قماش</p>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((f) => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <FabricCard fabric={f} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground mb-2">لم يتم العثور على نتائج</p>
            <p className="font-body text-sm text-muted-foreground">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div>
    <label className="text-xs text-muted-foreground font-body mb-1 block">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="">الكل</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export default Gallery;
