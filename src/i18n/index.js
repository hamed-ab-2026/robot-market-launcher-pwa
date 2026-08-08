import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fa from "./locales/fa.json";
import en from "./locales/en.json";

// -----------------------------------------------------------------------
// EN: Central i18n configuration.
//
//     ROOT CAUSE of "app defaults to English": the previous config used
//     i18next-browser-languagedetector with `order: ["localStorage",
//     "navigator"]`. On a first visit (nothing in localStorage yet) it
//     fell through to `navigator` — the OS/browser's own locale. Because
//     "en" is a valid entry in `supportedLngs`, the detector treated it
//     as a perfectly good match and used it directly. `fallbackLng` is
//     ONLY consulted when detection finds NOTHING usable at all — it
//     never overrides a language the detector actually found, even if
//     that language isn't the one you want as your default. So any
//     visitor with an English-language browser/OS saw an English UI,
//     regardless of fallbackLng: "fa".
//
//     FIX: set `lng: "fa"` explicitly. Per i18next's own docs, passing
//     `lng` in init() makes i18next use that language directly and
//     skips the detection routine entirely for the initial language —
//     so browser/OS locale can no longer silently win. We still want a
//     user's manual language choice (via LanguageSwitcher) to survive a
//     refresh, so getInitialLanguage() below reads directly from
//     localStorage first and only falls back to "fa" — never to
//     `navigator` — if nothing has been saved yet. This is the
//     "ignore browser detection, guarantee Persian" behavior requested.
//
// FA: تنظیمات مرکزی i18n.
//
//     ریشه مشکل "اپ به‌صورت پیش‌فرض انگلیسی است": تنظیمات قبلی از
//     i18next-browser-languagedetector با ترتیب ["localStorage",
//     "navigator"] استفاده می‌کرد. در اولین بازدید (چیزی در
//     localStorage نیست) به navigator (زبان مرورگر/سیستم‌عامل) می‌رسید.
//     چون "en" در supportedLngs معتبر است، detector آن را یک تطابق کاملاً
//     قابل‌قبول در نظر می‌گرفت. fallbackLng فقط زمانی بررسی می‌شود که
//     detection هیچ چیز قابل‌استفاده‌ای پیدا نکند — هرگز زبانی را که
//     detector واقعاً پیدا کرده جایگزین نمی‌کند.
//
//     راه‌حل: تنظیم صریح lng: "fa". طبق مستندات خود i18next، پاس دادن
//     lng در init باعث می‌شود i18next مستقیماً از همان زبان استفاده کند
//     و کل روتین تشخیص را برای زبان اولیه رد کند — پس زبان مرورگر/سیستم
//     دیگر نمی‌تواند بی‌صدا برنده شود. برای اینکه انتخاب دستی زبان کاربر
//     (از طریق LanguageSwitcher) بعد از رفرش باقی بماند، getInitialLanguage
//     پایین ابتدا مستقیماً localStorage را می‌خواند و فقط در صورت نبود
//     مقدار ذخیره‌شده — و هرگز از navigator — به "fa" برمی‌گردد.
// -----------------------------------------------------------------------

export const SUPPORTED_LANGUAGES = ["fa", "en"];
export const LANGUAGE_STORAGE_KEY = "app_language";

const resources = {
  fa: { translation: fa },
  en: { translation: en }
};

/**
 * EN: Reads a previously-saved user choice from localStorage. Returns
 *     "fa" (never the browser/OS locale) if nothing has been saved yet
 *     — this is the one and only place a default gets decided.
 * FA: انتخاب ذخیره‌شده قبلی کاربر را از localStorage می‌خواند. اگر چیزی
 *     ذخیره نشده باشد "fa" برمی‌گرداند (هرگز زبان مرورگر/سیستم را) —
 *     این تنها جایی است که پیش‌فرض تعیین می‌شود.
 */
function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — fall through.
  }
  return "fa";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(), // explicit — bypasses auto-detection, so browser/OS locale is never consulted
  fallbackLng: "fa", // used only if a translation key is missing in the active language
  supportedLngs: SUPPORTED_LANGUAGES,
  debug: false,
  interpolation: {
    escapeValue: false // React already escapes output, no need to double-escape
  }
});

/**
 * EN: Updates the <html> tag's `dir` and `lang` attributes so the whole
 *     document (including Ant Design portals like modals/dropdowns)
 *     renders right-to-left for Persian and left-to-right for English.
 * FA: ویژگی‌های dir و lang تگ <html> را به‌روزرسانی می‌کند تا کل صفحه
 *     (شامل پورتال‌های آنت‌دیزاین مثل مودال‌ها) جهت درست را داشته باشد.
 */
export function applyDocumentDirection(language) {
  const dir = language === "en" ? "ltr" : "rtl";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", language);
}

// Apply immediately for the initial language.
applyDocumentDirection(i18n.resolvedLanguage || "fa");

// Keep it in sync on every future language change (e.g. via LanguageSwitcher).
i18n.on("languageChanged", (lng) => applyDocumentDirection(lng));

export default i18n;
