import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { user } = useAuth();
  const [perms, setPerms] = useState<string[]>([]);
  const [roleKeys, setRoleKeys] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPerms([]);
      setRoleKeys([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      const admin = !!roles?.length;

      const { data: assigns } = await supabase
        .from("staff_assignments")
        .select("role_key")
        .eq("user_id", user.id);
      const keys = (assigns || []).map((a) => a.role_key);

      let p: string[] = [];
      if (keys.length) {
        const { data: rp } = await supabase
          .from("role_permissions")
          .select("permission_key")
          .in("role_key", keys);
        p = (rp || []).map((r) => r.permission_key);
      }
      if (!active) return;
      setIsAdmin(admin);
      setRoleKeys(keys);
      setPerms([...new Set(p)]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const can = (perm: string) => isAdmin || perms.includes(perm);

  return { can, isAdmin, perms, roleKeys, loading };
}
