import { useEffect, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as Notification[]) || []);
  };

  useEffect(() => {
    if (!user) { setItems([]); return; }
    fetchItems();
    const channel = supabase
      .channel("notifications-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const unread = items.filter((i) => !i.is_read).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)));
  };
  const markAll = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative p-2 text-foreground hover:text-primary transition-colors" aria-label="Notifications">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-background shadow-xl"
          style={{ [lang === "ar" ? "left" : "right"]: 0 } as any} dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display text-sm text-foreground">{lang === "ar" ? "الإشعارات" : "Notifications"}</span>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-xs text-primary font-body">
                <Check size={12} /> {lang === "ar" ? "تعليم الكل كمقروء" : "Mark all read"}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="py-8 text-center font-body text-sm text-muted-foreground">{lang === "ar" ? "لا توجد إشعارات" : "No notifications"}</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className={`group flex items-start gap-2 border-b border-border px-4 py-3 ${n.is_read ? "" : "bg-primary/5"}`}>
                  {!n.is_read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                  <button onClick={() => !n.is_read && markRead(n.id)} className="flex-1 text-start">
                    <div className="font-body text-sm font-medium text-foreground">{n.title}</div>
                    {n.body && <div className="font-body text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                    <div className="font-body text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</div>
                  </button>
                  <button onClick={() => remove(n.id)} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;