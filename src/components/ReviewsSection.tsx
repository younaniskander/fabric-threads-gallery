import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  user_name: string | null;
  created_at: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Stars = ({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(i)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={
              (hover || value) >= i
                ? "fill-gold text-gold"
                : "text-muted-foreground/40"
            }
          />
        </button>
      ))}
    </div>
  );
};

const ReviewsSection = ({ fabricId }: { fabricId: string }) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isDbFabric = UUID_RE.test(fabricId);

  const load = async () => {
    if (!isDbFabric) { setLoading(false); return; }
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("fabric_id", fabricId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricId]);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReview?.id]);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const submit = async () => {
    if (!user) return;
    if (rating < 1) {
      toast.error(ar ? "اختر تقييمًا بالنجوم" : "Please select a rating");
      return;
    }
    setSubmitting(true);
    let name = ar ? "عميل" : "Customer";
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    if (prof?.full_name) name = prof.full_name;
    const { error } = await supabase.from("reviews").upsert(
      {
        fabric_id: fabricId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        user_name: name,
      },
      { onConflict: "fabric_id,user_id" }
    );
    setSubmitting(false);
    if (error) {
      toast.error(ar ? "تعذّر حفظ التقييم" : "Could not save review");
      return;
    }
    toast.success(ar ? "تم حفظ تقييمك، شكرًا لك!" : "Your review was saved, thank you!");
    load();
  };

  const remove = async () => {
    if (!myReview) return;
    await supabase.from("reviews").delete().eq("id", myReview.id);
    toast.success(ar ? "تم حذف تقييمك" : "Review removed");
    load();
  };

  if (!isDbFabric) return null;

  return (
    <div className="mt-16 border-t border-border pt-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="font-display text-2xl text-foreground">
          {ar ? "التقييمات والمراجعات" : "Ratings & Reviews"}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <Stars value={Math.round(avg)} size={18} />
            <span className="font-body text-sm text-muted-foreground">
              {avg.toFixed(1)} ({reviews.length} {ar ? "تقييم" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Add / edit form */}
      {user ? (
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <p className="font-body text-sm text-foreground mb-3">
            {myReview ? (ar ? "عدّل تقييمك" : "Edit your review") : (ar ? "أضف تقييمك" : "Add your review")}
          </p>
          <div className="mb-3">
            <Stars value={rating} size={24} onChange={setRating} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder={ar ? "اكتب رأيك في القماش (اختياري)" : "Share your thoughts (optional)"}
            className="font-body mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={submit} disabled={submitting} className="font-body">
              {submitting ? (ar ? "جارٍ الحفظ..." : "Saving...") : ar ? "إرسال التقييم" : "Submit review"}
            </Button>
            {myReview && (
              <Button variant="outline" onClick={remove} className="font-body text-destructive">
                {ar ? "حذف" : "Delete"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 mb-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            {ar ? "سجّل الدخول لإضافة تقييم." : "Sign in to leave a review."}{" "}
            <Link to="/auth" className="text-primary hover:underline">
              {ar ? "تسجيل الدخول" : "Sign in"}
            </Link>
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="font-body text-sm text-muted-foreground">{ar ? "جارٍ التحميل..." : "Loading..."}</p>
      ) : reviews.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">
          {ar ? "لا توجد تقييمات بعد. كن أول من يقيّم!" : "No reviews yet. Be the first!"}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm font-medium text-foreground">
                  {r.user_name || (ar ? "عميل" : "Customer")}
                </span>
                <span className="font-body text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                </span>
              </div>
              <Stars value={r.rating} />
              {r.comment && <p className="font-body text-sm text-muted-foreground mt-2">{r.comment}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
