import { isValidPhoneNumber } from "libphonenumber-js";

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

export function isValidAddress(address: string) {
  const trimmed = address.trim();
  // A real address: enough length and contains some letters (not just digits).
  return trimmed.length >= 10 && /[\p{L}]/u.test(trimmed);
}

function normalizeNameForAuth(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function phoneToAuthCredentials(phone: string, name: string) {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\D/g, "");
  const normalizedName = normalizeNameForAuth(name);
  return {
    email: `phone-${digits}@${AUTH_DOMAIN}`,
    password: `${PASSWORD_PREFIX}-${digits}-${encodeURIComponent(normalizedName)}`,
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