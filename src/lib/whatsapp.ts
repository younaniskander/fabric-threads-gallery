// Central WhatsApp configuration for ADAM Fabrics
export const WHATSAPP_NUMBER_INTL = "201013640361"; // international format (no +)
export const WHATSAPP_NUMBER_LOCAL = "01013640361"; // local display format

export const DEFAULT_WHATSAPP_MESSAGE_AR =
  "مرحبًا، أريد الاستفسار عن منتجات آدم للقماش.";
export const DEFAULT_WHATSAPP_MESSAGE_EN =
  "Hello, I would like to inquire about ADAM Fabrics products.";

/**
 * Build a WhatsApp link with an optional pre-filled message.
 * Always uses the official wa.me short link, which works on both mobile
 * (opens the native app) and desktop (opens WhatsApp Web) and avoids the
 * api.whatsapp.com / web.whatsapp.com URLs that some browsers/networks block.
 */
export function buildWhatsAppLink(message?: string): string {
  const phone = WHATSAPP_NUMBER_INTL;
  const encodedMessage = message ? encodeURIComponent(message) : "";
  return encodedMessage
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/${phone}`;
}

/**
 * Default link using the localized default inquiry message.
 */
export function defaultWhatsAppLink(lang: "ar" | "en" = "ar"): string {
  return buildWhatsAppLink(
    lang === "ar" ? DEFAULT_WHATSAPP_MESSAGE_AR : DEFAULT_WHATSAPP_MESSAGE_EN,
  );
}
