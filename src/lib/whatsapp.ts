// Central WhatsApp configuration for ADAM Fabrics
export const WHATSAPP_NUMBER_INTL = "201013640361"; // international format (no +)
export const WHATSAPP_NUMBER_LOCAL = "01013640361"; // local display format

export const DEFAULT_WHATSAPP_MESSAGE_AR =
  "مرحبًا، أريد الاستفسار عن منتجات آدم للقماش.";
export const DEFAULT_WHATSAPP_MESSAGE_EN =
  "Hello, I would like to inquire about ADAM Fabrics products.";

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/**
 * Build a WhatsApp link with an optional pre-filled message.
 * Uses wa.me on mobile (opens the WhatsApp app) and web.whatsapp.com on desktop
 * to avoid the api.whatsapp.com redirect that some browsers/networks block.
 */
export function buildWhatsAppLink(message?: string): string {
  const phone = WHATSAPP_NUMBER_INTL;
  const encodedMessage = message ? encodeURIComponent(message) : "";

  if (isMobileDevice()) {
    // Mobile: wa.me opens the native WhatsApp app directly
    return encodedMessage
      ? `https://wa.me/${phone}?text=${encodedMessage}`
      : `https://wa.me/${phone}`;
  }

  // Desktop: use WhatsApp Web directly to avoid blocked api.whatsapp.com redirects
  return encodedMessage
    ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${phone}`;
}

/**
 * Default link using the localized default inquiry message.
 */
export function defaultWhatsAppLink(lang: "ar" | "en" = "ar"): string {
  return buildWhatsAppLink(
    lang === "ar" ? DEFAULT_WHATSAPP_MESSAGE_AR : DEFAULT_WHATSAPP_MESSAGE_EN,
  );
}
