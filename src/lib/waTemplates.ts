import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Render a WhatsApp template body by replacing {{var}} placeholders.
 */
export function renderTemplate(body: string, vars: Record<string, string | number>) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

/**
 * Build a wa.me link for a specific recipient phone number (international, no +).
 */
export function buildWaLinkTo(phoneIntl: string, message: string) {
  const clean = (phoneIntl || "").replace(/\D/g, "");
  const base = clean ? `https://wa.me/${clean}` : buildWhatsAppLink();
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return clean ? `${base}${text}` : buildWhatsAppLink(message);
}

export const TEMPLATE_VARS = ["name", "order", "total", "points", "balance"];