import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User as UserIcon, Package, Heart, LogOut, Edit2, Save, Inbox, MessageSquare, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFabrics } from "@/hooks/useFabrics";
import FabricCard from "@/components/FabricCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Tab = "profile" | "orders" | "loyalty" | "inbox" | "wishlist";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<{ full_name: string; phone: string }>({ full_name: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [loyaltyTx, setLoyaltyTx] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const [messageReplies, setMessageReplies] = useState<Record<string, any[]>>({});
  const allFabrics = useFabrics();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    // Load profile
    supabase.from("profiles").select("full_name, phone, loyalty_points").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile({ full_name: data.full_name || "", phone: data.phone || "" });
        setPoints((data as any).loyalty_points || 0);
      }
    });
    // Load loyalty transactions
    supabase.from("loyalty_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setLoyaltyTx(data);
    });
    // Load orders
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
    // Load wishlist
    supabase.from("wishlist").select("fabric_id").eq("user_id", user.id).then(({ data }) => {
      if (data) setWishlistIds(data.map((w: any) => w.fabric_id));
    });
    // Load user messages
    supabase.from("messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) {
        setMyMessages(data);
        // Load replies for each message
        data.forEach((msg: any) => {
          supabase.from("message_replies").select("*").eq("message_id", msg.id).order("created_at", { ascending: true }).then(({ data: replyData }) => {
            if (replyData) setMessageReplies((prev) => ({ ...prev, [msg.id]: replyData }));
          });
        });
      }
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) {
      toast.error(lang === "ar" ? "خطأ في الحفظ" : "Save error");
    } else {
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
      setEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  const wishlistFabrics = allFabrics.filter((f) => wishlistIds.includes(f.id));

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "profile", label: lang === "ar" ? "الملف الشخصي" : "Profile", icon: UserIcon },
    { id: "orders", label: lang === "ar" ? "طلباتي" : "My Orders", icon: Package },
    { id: "loyalty", label: lang === "ar" ? "نقاطي" : "My Points", icon: Gift },
    { id: "inbox", label: lang === "ar" ? "الرسائل" : "Inbox", icon: Inbox },
    { id: "wishlist", label: lang === "ar" ? "المفضلة" : "Wishlist", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <p className="font-display text-lg text-foreground mb-4">{profile.full_name || user.email}</p>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                    tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={16} />
                {lang === "ar" ? "تسجيل خروج" : "Sign Out"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {tab === "profile" && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl text-foreground">{lang === "ar" ? "الملف الشخصي" : "Profile"}</h2>
                    {!editing ? (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
                        <Edit2 size={14} /> {lang === "ar" ? "تعديل" : "Edit"}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={saveProfile} className="gap-2">
                        <Save size={14} /> {lang === "ar" ? "حفظ" : "Save"}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs text-muted-foreground font-body block mb-1">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                      <Input value={user.email || ""} disabled dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-body block mb-1">{lang === "ar" ? "الاسم" : "Name"}</label>
                      <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} disabled={!editing} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-body block mb-1">{lang === "ar" ? "الهاتف" : "Phone"}</label>
                      <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!editing} dir="ltr" />
                    </div>
                  </div>
                </div>
              )}

              {tab === "orders" && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl text-foreground mb-4">{lang === "ar" ? "طلباتي" : "My Orders"}</h2>
                  {orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-10 text-center">
                      <Package size={40} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-body">{lang === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground font-body">
                            {new Date(order.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-body ${
                            order.status === "delivered" || order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status === "delivered" || order.status === "completed"
                              ? (lang === "ar" ? "تم التسليم" : "Delivered")
                              : order.status === "cancelled"
                              ? (lang === "ar" ? "ملغي" : "Cancelled")
                              : (lang === "ar" ? "قيد المعالجة" : "Pending")}
                          </span>
                        </div>
                        <p className="text-sm font-body text-foreground">
                          {lang === "ar" ? "الإجمالي:" : "Total:"} {order.total_amount} {lang === "ar" ? "ج.م" : "EGP"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "inbox" && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl text-foreground mb-4">{lang === "ar" ? "الرسائل والردود" : "Messages & Replies"}</h2>
                  {myMessages.length === 0 ? (
                    <></>
                  ) : null}
                  {false ? null : null}
                  {myMessages.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-10 text-center">
                      <MessageSquare size={40} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-body">{lang === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}</p>
                    </div>
                  ) : (
                    myMessages.map((msg) => (
                      <div key={msg.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="mb-3">
                          <p className="font-body text-sm text-foreground">{msg.message}</p>
                          <span className="font-body text-xs text-muted-foreground mt-1 block">
                            {new Date(msg.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                          </span>
                        </div>
                        {messageReplies[msg.id] && messageReplies[msg.id].length > 0 ? (
                          <div className="border-t border-border pt-3 space-y-2">
                            <p className="font-body text-xs text-primary font-semibold">{lang === "ar" ? "ردود الإدارة:" : "Admin replies:"}</p>
                            {messageReplies[msg.id].map((r: any) => (
                              <div key={r.id} className="bg-muted rounded-lg p-3">
                                <p className="font-body text-sm text-foreground">{r.reply_text}</p>
                                <span className="font-body text-xs text-muted-foreground mt-1 block">
                                  {new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-t border-border pt-3">
                            <p className="font-body text-xs text-muted-foreground">{lang === "ar" ? "في انتظار الرد..." : "Awaiting reply..."}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "wishlist" && (
                <div>
                  <h2 className="font-display text-xl text-foreground mb-4">{lang === "ar" ? "المفضلة" : "Wishlist"}</h2>
                  {wishlistFabrics.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-10 text-center">
                      <Heart size={40} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-body">{lang === "ar" ? "لا توجد منتجات في المفضلة" : "No items in wishlist"}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistFabrics.map((f) => (
                        <FabricCard key={f.id} fabric={f} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
