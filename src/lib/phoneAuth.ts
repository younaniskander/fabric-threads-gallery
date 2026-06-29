import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

const AUTH_DOMAIN = "adam-phone.local";
const PASSWORD_PREFIX = "ADAM-phone-login-v1";

const arabicDigitMap: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

export function toLatinDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => arabicDigitMap[digit] ?? digit);
}

export function normalizePhone(value: string) {
  const latin = toLatinDigits(value);
  const leadingPlus = latin.trim().startsWith("+") ? "+" : "";
  return `${leadingPlus}${latin.replace(/\D/g, "")}`;
}

export function isValidCustomerName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 4 || trimmed.length > 100) return false;
  // Require at least two words (first + last), each word at least 2 letters.
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length < 2) return false;
  // Only letters (Arabic/Latin) and spaces are allowed.
  return /^[\p{L}\s]+$/u.test(trimmed);
}

export function isValidPhone(phone: string) {
  // Accepts any valid international number (E.164, e.g. +201013640361).
  const value = toLatinDigits(phone).trim();
  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

/**
 * Return the full phone number in canonical E.164 form (e.g. +201013640361).
 * Falls back to a normalized value if parsing fails, so we never silently
 * drop the country code or digits.
 */
export function toE164Phone(phone: string) {
  const value = toLatinDigits(phone).trim();
  try {
    const parsed = parsePhoneNumberFromString(value);
    if (parsed && parsed.isValid()) return parsed.number; // E.164, e.g. +20101...
  } catch {
    /* ignore */
  }
  return normalizePhone(value);
}

/**
 * Human-friendly international format (e.g. +20 101 364 0361) wrapped in
 * left-to-right marks so it never gets reversed inside Arabic/RTL text such
 * as a WhatsApp order message.
 */
export function formatPhoneForMessage(phone: string) {
  const value = toLatinDigits(phone).trim();
  let display = value;
  try {
    const parsed = parsePhoneNumberFromString(value);
    if (parsed && parsed.isValid()) display = parsed.formatInternational();
  } catch {
    /* ignore */
  }
  // U+2066 LRI ... U+2069 PDI keeps the number rendering left-to-right.
  return `\u2066${display}\u2069`;
}

export function isValidAddress(address: string) {
  const trimmed = address.trim();
  // A real address: enough length and contains some letters (not just digits).
  return trimmed.length >= 10 && /[\p{L}]/u.test(trimmed);
}

function normalizeNameForAuth(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

// Compact, deterministic 53-bit hash (cyrb53) so the derived password stays
// well under Supabase's 72-character limit even for long Arabic names.
function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function phoneToAuthCredentials(phone: string, name: string) {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\D/g, "");
  const normalizedName = normalizeNameForAuth(name);
  // Hash the name so the password length is bounded (avoids the 72-char limit).
  const nameHash = cyrb53(normalizedName);
  return {
    email: `phone-${digits}@${AUTH_DOMAIN}`,
    password: `${PASSWORD_PREFIX}-${digits}-${nameHash}`,
    normalizedPhone: normalized,
  };
}

export function parsePriceAmount(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const normalized = toLatinDigits(value)
    .replace(/,/g, "")
    .match(/\d+(?:\.\d+)?/);

  return normalized ? Number(normalized[0]) : 0;
}

export function formatMoney(value: number, lang: "ar" | "en") {
  return `${value.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} ${lang === "ar" ? "ج.م" : "EGP"}`;
}