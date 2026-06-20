// Central WhatsApp configuration for ADAM Fabrics
export const WHATSAPP_NUMBER_INTL = "201013640361"; // international format (no +)
export const WHATSAPP_NUMBER_LOCAL = "01013640361"; // local display format

export const DEFAULT_WHATSAPP_MESSAGE_AR =
  "مرحبًا، أريد الاستفسار عن منتجات آدم للقماش.";
export const DEFAULT_WHATSAPP_MESSAGE_EN =
  "Hello, I would like to inquire about ADAM Fabrics products.";

/**
 * Build a wa.me link with an optional pre-filled message.
 */
export function buildWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER_INTL}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Default link using the localized default inquiry message.
 */
export function defaultWhatsAppLink(lang: "ar" | "en" = "ar"): string {
  return buildWhatsAppLink(
    lang === "ar" ? DEFAULT_WHATSAPP_MESSAGE_AR : DEFAULT_WHATSAPP_MESSAGE_EN,
  );
}