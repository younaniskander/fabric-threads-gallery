import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fabrics as staticFabrics, type Fabric } from "@/data/fabrics";
import { parsePriceAmount } from "@/lib/phoneAuth";

function mapRow(row: any): Fabric {
  const colors: string[] = Array.isArray(row.colors) ? row.colors : [];
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en || row.name,
    type: row.type,
    category: row.category,
    brand: row.brand,
    image: row.image_url || "/placeholder.svg",
    colorVariants: colors.map((c: string) => ({ name: c, color: c })),
    colors,
    gsm: row.gsm || 0,
    origin: row.origin || "",
    composition: row.composition || "",
    price: row.price || "",
    priceNum: parsePriceAmount(row.price),
    features: row.features || [],
    usage: row.usage_suggestions || [],
    isFeatured: !!row.is_featured,
    isNew: !!row.is_new,
    isPopular: !!row.is_popular,
    comingSoon: !!row.coming_soon,
    hasOffer: !!row.has_offer,
    offerText: row.offer_text || "",
    inAllBranches: row.in_all_branches !== false,
  };
}


export function useFabrics(): Fabric[] {
  const [dbFabrics, setDbFabrics] = useState<Fabric[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("fabrics_db")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active && data) setDbFabrics(data.map(mapRow));
      });
    return () => {
      active = false;
    };
  }, []);

  return [...dbFabrics, ...staticFabrics];
}
