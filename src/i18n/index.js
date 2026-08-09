import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fa from "./locales/fa.json";
import en from "./locales/en.json";














































export const SUPPORTED_LANGUAGES = ["fa", "en"];
export const LANGUAGE_STORAGE_KEY = "app_language";

const resources = {
  fa: { translation: fa },
  en: { translation: en }
};









/**
 * زبان ذخیره‌شده کاربر را از localStorage می‌خواند.
 * اگر مقدار ذخیره‌شده معتبر نباشد، فارسی را به‌عنوان زبان امن و پیش‌فرض برنامه انتخاب می‌کند.
 */
function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch {

  }
  return "fa";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "fa",
  supportedLngs: SUPPORTED_LANGUAGES,
  debug: false,
  interpolation: {
    escapeValue: false
  }
});








/**
 * ویژگی‌های lang و dir عنصر html را با زبان فعال هماهنگ می‌کند.
 * این کار باعث می‌شود هم محتوای React و هم مودال‌های خارج از درخت اصلی جهت صحیح RTL یا LTR داشته باشند.
 */
export function applyDocumentDirection(language) {
  const dir = language === "en" ? "ltr" : "rtl";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", language);
}


applyDocumentDirection(i18n.resolvedLanguage || "fa");


i18n.on("languageChanged", (lng) => applyDocumentDirection(lng));

export default i18n;
