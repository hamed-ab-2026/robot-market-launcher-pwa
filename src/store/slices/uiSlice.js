import { createSlice } from "@reduxjs/toolkit";
import i18n, { LANGUAGE_STORAGE_KEY } from "../../i18n";

// -----------------------------------------------------------------------
// EN: uiSlice owns everything about the app's "look & shell":
//       - darkMode: boolean, default FALSE (light mode) per spec
//       - language: "fa" | "en", default "fa" per spec
//       - isSidebarOpen: mobile right-drawer / bottom sheet visibility
//     darkMode and language are persisted to localStorage so a refresh
//     doesn't reset the user's preferences.
//
//     Note: PWA standalone-mode detection is intentionally NOT stored
//     here. It's derived, reactive state (see hooks/useIsStandalone.js)
//     that must always reflect the browser's live matchMedia result —
//     keeping a copy of it in Redux would just be a second source of
//     truth that could silently go stale.
// FA: uiSlice مسئول تنظیمات ظاهری اپلیکیشن است:
//       - darkMode: پیش‌فرض false (روشن)
//       - language: پیش‌فرض "fa"
//       - isSidebarOpen: وضعیت نمایش دراور/بمینو موبایل
//     darkMode و language در localStorage ذخیره می‌شوند.
//
//     توجه: تشخیص حالت standalone عمداً اینجا نگه‌داری نمی‌شود. این یک
//     state مشتق‌شده و واکنش‌گراست (نگاه کنید به hooks/useIsStandalone.js)
//     که باید همیشه نتیجه زنده matchMedia مرورگر را نشان دهد — نگه‌داشتن
//     یک کپی از آن در ردداکس فقط یک منبع حقیقت دوم ایجاد می‌کند که
//     می‌تواند بی‌سروصدا قدیمی/نادرست شود.
// -----------------------------------------------------------------------

const DARK_MODE_STORAGE_KEY = "app_dark_mode";

/** Reads a boolean flag from localStorage, defaulting safely to `false`. */
function readPersistedDarkMode() {
  try {
    return localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — fail safe.
    return false;
  }
}

const initialState = {
  darkMode: readPersistedDarkMode(),
  language: i18n.resolvedLanguage || "fa",
  isSidebarOpen: false // controls the mobile right-drawer / bottom sheet
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      persistDarkMode(state.darkMode);
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
      persistDarkMode(state.darkMode);
    },
    setLanguage(state, action) {
      const lng = action.payload;
      state.language = lng;
      // i18next handles its own persistence via the LanguageDetector cache,
      // but we set it explicitly here too so both systems always agree.
      i18n.changeLanguage(lng);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      } catch {
        /* ignore write errors (e.g. storage quota / private mode) */
      }
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    }
  }
});

function persistDarkMode(value) {
  try {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(value));
  } catch {
    /* ignore write errors */
  }
}

export const { toggleDarkMode, setDarkMode, setLanguage, toggleSidebar, closeSidebar } = uiSlice.actions;

export default uiSlice.reducer;
