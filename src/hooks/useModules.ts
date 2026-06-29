import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppModule = {
  key: string;
  name: string;
  name_ar: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
  sort_order: number;
};

let cache: AppModule[] | null = null;

export function useModules() {
  const [modules, setModules] = useState<AppModule[]>(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    supabase
      .from("app_modules")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (!active) return;
        cache = (data as AppModule[]) || [];
        setModules(cache);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isEnabled = (key: string) =>
    modules.find((m) => m.key === key)?.enabled ?? false;

  const refresh = async () => {
    const { data } = await supabase.from("app_modules").select("*").order("sort_order");
    cache = (data as AppModule[]) || [];
    setModules(cache);
  };

  return { modules, loading, isEnabled, refresh };
}
