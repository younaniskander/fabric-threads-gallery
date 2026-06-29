import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Award, Smartphone } from "lucide-react";
import logo from "@/assets/adam-logo-new.png";

export const LOYALTY_QR_PREFIX = "ADAMLOYALTY:";

interface Props {
  token: string;
  name: string;
  points: number;
  levelName: string;
  levelColor: string;
  discount: number;
  lang?: "ar" | "en";
}

export default function LoyaltyCard({
  token,
  name,
  points,
  levelName,
  levelColor,
  discount,
  lang = "ar",
}: Props) {
  const memberCode = (token || "").replace(/-/g, "").slice(0, 10).toUpperCase();
  const qrValue = LOYALTY_QR_PREFIX + token;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl p-6 text-white shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, #1f2937 0%, #111827 60%, #0b0f17 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
        style={{ background: levelColor }}
      />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="ADAM" className="h-9 w-9 rounded-md bg-white/10 p-1" />
          <div>
            <p className="font-display text-base leading-none">ADAM</p>
            <p className="text-[10px] text-white/60">
              {lang === "ar" ? "بطاقة الولاء" : "Loyalty Card"}
            </p>
          </div>
        </div>
        <span
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: levelColor + "33", color: levelColor }}
        >
          <Award size={12} /> {levelName}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="rounded-xl bg-white p-2">
          <QRCodeSVG value={qrValue} size={104} level="M" includeMargin={false} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-white/60">{lang === "ar" ? "العضو" : "Member"}</p>
          <p className="truncate font-display text-lg">{name || "—"}</p>
          <p className="mt-2 text-xs text-white/60">{lang === "ar" ? "النقاط" : "Points"}</p>
          <p className="font-display text-2xl text-amber-300">{points}</p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-3">
        <div>
          <p className="text-[10px] text-white/50">{lang === "ar" ? "رقم العضوية" : "Member ID"}</p>
          <p className="font-mono text-sm tracking-widest">{memberCode}</p>
        </div>
        {discount > 0 && (
          <p className="text-[11px] text-white/70">
            {lang === "ar" ? `خصم العضوية ${discount}%` : `${discount}% member off`}
          </p>
        )}
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
        <Smartphone size={11} />
        {lang === "ar"
          ? "اعرض هذا الرمز للكاشير لكسب واستبدال النقاط"
          : "Show this code at checkout to earn & redeem points"}
      </p>
    </motion.div>
  );
}
