import { useEffect, useState } from "react";
import { Shield, Plus, Trash2, UserPlus, Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Role = { key: string; name_ar: string; is_system: boolean };
type Perm = { key: string; name_ar: string; category: string };
type Assign = { id: string; user_id: string; role_key: string; branch_id: string | null };

const RolesSection = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<Perm[]>([]);
  const [rolePerms, setRolePerms] = useState<Record<string, Set<string>>>({});
  const [active, setActive] = useState<string>("");
  const [newRole, setNewRole] = useState({ key: "", name_ar: "" });

  // staff assignment
  const [branches, setBranches] = useState<{ id: string; name_ar: string }[]>([]);
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; phone: string | null }>>({});
  const [sq, setSq] = useState("");
  const [found, setFound] = useState<{ id: string; full_name: string | null; phone: string | null } | null>(null);
  const [assignRole, setAssignRole] = useState("");
  const [assignBranch, setAssignBranch] = useState("none");

  const load = async () => {
    const [r, p, rp, b, a] = await Promise.all([
      supabase.from("roles").select("*"),
      supabase.from("permissions").select("*"),
      supabase.from("role_permissions").select("*"),
      supabase.from("branches").select("id,name_ar"),
      supabase.from("staff_assignments").select("*"),
    ]);
    const rs = (r.data as Role[]) || [];
    setRoles(rs);
    setPerms((p.data as Perm[]) || []);
    const map: Record<string, Set<string>> = {};
    rs.forEach((role) => (map[role.key] = new Set()));
    (rp.data || []).forEach((x: any) => { (map[x.role_key] = map[x.role_key] || new Set()).add(x.permission_key); });
    setRolePerms(map);
    setBranches((b.data as any) || []);
    const al = (a.data as Assign[]) || [];
    setAssigns(al);
    if (!active && rs.length) setActive(rs[0].key);
    // load profile names for assignments
    const ids = [...new Set(al.map((x) => x.user_id))];
    if (ids.length) {
      const { data: pr } = await supabase.from("profiles").select("id,full_name,phone").in("id", ids);
      const pm: Record<string, any> = {};
      (pr || []).forEach((x: any) => (pm[x.id] = { full_name: x.full_name, phone: x.phone }));
      setProfiles(pm);
    }
  };
  useEffect(() => { load(); }, []);

  const togglePerm = async (roleKey: string, permKey: string) => {
    const has = rolePerms[roleKey]?.has(permKey);
    setRolePerms((s) => {
      const set = new Set(s[roleKey] || []);
      has ? set.delete(permKey) : set.add(permKey);
      return { ...s, [roleKey]: set };
    });
    if (has) await supabase.from("role_permissions").delete().eq("role_key", roleKey).eq("permission_key", permKey);
    else await supabase.from("role_permissions").insert({ role_key: roleKey, permission_key: permKey });
  };

  const addRole = async () => {
    if (!newRole.key.trim() || !newRole.name_ar.trim()) { toast({ title: "أدخل المفتاح والاسم", variant: "destructive" }); return; }
    const { error } = await supabase.from("roles").insert({ key: newRole.key.trim().toLowerCase().replace(/\s+/g, "_"), name: newRole.name_ar.trim(), name_ar: newRole.name_ar.trim(), is_system: false });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تمت إضافة الدور" }); setNewRole({ key: "", name_ar: "" }); load();
  };
  const delRole = async (key: string) => { await supabase.from("roles").delete().eq("key", key); toast({ title: "تم حذف الدور" }); load(); };

  const searchStaff = async () => {
    if (!sq.trim()) return;
    const { data } = await supabase.from("profiles").select("id,full_name,phone").or(`phone.ilike.%${sq.trim()}%,full_name.ilike.%${sq.trim()}%`).limit(1).maybeSingle();
    if (data) setFound(data as any); else { setFound(null); toast({ title: "لا يوجد مستخدم", variant: "destructive" }); }
  };
  const assign = async () => {
    if (!found || !assignRole) { toast({ title: "اختر المستخدم والدور", variant: "destructive" }); return; }
    const { error } = await supabase.from("staff_assignments").insert({ user_id: found.id, role_key: assignRole, branch_id: assignBranch === "none" ? null : assignBranch });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم تعيين الموظف" }); setFound(null); setSq(""); setAssignRole(""); load();
  };
  const delAssign = async (id: string) => { await supabase.from("staff_assignments").delete().eq("id", id); load(); };

  const cats = [...new Set(perms.map((p) => p.category))];

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="flex items-center gap-2 font-display text-xl text-foreground"><Shield size={20} className="text-primary" /> الأدوار والصلاحيات</h2>

      {/* role tabs */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button key={r.key} onClick={() => setActive(r.key)}
            className={`rounded-full px-3 py-1.5 font-body text-sm ${active === r.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-fabric"}`}>
            {r.name_ar} {!r.is_system && "★"}
          </button>
        ))}
      </div>

      {/* permission matrix for active role */}
      {active && (
        <div className="rounded-xl bg-card p-5 shadow-fabric">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">صلاحيات: {roles.find((r) => r.key === active)?.name_ar}</h3>
            {!roles.find((r) => r.key === active)?.is_system && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => delRole(active)}><Trash2 size={14} /> حذف الدور</Button>
            )}
          </div>
          {cats.map((cat) => (
            <div key={cat} className="mb-3">
              <p className="mb-1 font-body text-xs font-semibold uppercase text-muted-foreground">{cat}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {perms.filter((p) => p.category === cat).map((p) => {
                  const on = rolePerms[active]?.has(p.key);
                  return (
                    <button key={p.key} onClick={() => togglePerm(active, p.key)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-right font-body text-sm transition-colors ${on ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>
                      {p.name_ar}
                      {on && <Check size={15} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* create custom role */}
      <div className="rounded-xl bg-card p-5 shadow-fabric">
        <h3 className="mb-3 font-display text-base text-foreground">إنشاء دور مخصص</h3>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="المفتاح (إنجليزي)" value={newRole.key} onChange={(e) => setNewRole({ ...newRole, key: e.target.value })} dir="ltr" className="max-w-[180px]" />
          <Input placeholder="اسم الدور" value={newRole.name_ar} onChange={(e) => setNewRole({ ...newRole, name_ar: e.target.value })} className="max-w-[200px] font-body" />
          <Button onClick={addRole} className="gap-2 font-body"><Plus size={16} /> إضافة</Button>
        </div>
      </div>

      {/* assign staff */}
      <div className="rounded-xl bg-card p-5 shadow-fabric">
        <h3 className="mb-3 flex items-center gap-2 font-display text-base text-foreground"><UserPlus size={18} className="text-primary" /> تعيين موظف لدور</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative">
            <Input placeholder="اسم/هاتف المستخدم" value={sq} onChange={(e) => setSq(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchStaff()} className="font-body" />
          </div>
          <Button variant="outline" size="icon" onClick={searchStaff}><Search size={16} /></Button>
          {found && <span className="rounded-lg bg-primary/10 px-3 py-2 font-body text-sm text-foreground">{found.full_name || found.phone}</span>}
          <Select value={assignRole} onValueChange={setAssignRole}>
            <SelectTrigger className="w-40 font-body"><SelectValue placeholder="الدور" /></SelectTrigger>
            <SelectContent>{roles.map((r) => <SelectItem key={r.key} value={r.key}>{r.name_ar}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={assignBranch} onValueChange={setAssignBranch}>
            <SelectTrigger className="w-40 font-body"><SelectValue placeholder="الفرع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">كل الفروع</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={assign} className="gap-2 font-body"><Check size={16} /> تعيين</Button>
        </div>

        <div className="mt-4 space-y-2">
          {assigns.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="font-body text-sm text-foreground">
                {profiles[a.user_id]?.full_name || profiles[a.user_id]?.phone || a.user_id.slice(0, 8)}
                <span className="mx-2 text-muted-foreground">—</span>
                <span className="text-primary">{roles.find((r) => r.key === a.role_key)?.name_ar || a.role_key}</span>
                {a.branch_id && <span className="mx-2 text-xs text-muted-foreground">{branches.find((b) => b.id === a.branch_id)?.name_ar}</span>}
              </span>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => delAssign(a.id)}><Trash2 size={14} /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesSection;
