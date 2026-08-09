import { createSlice } from "@reduxjs/toolkit";
import i18n, { LANGUAGE_STORAGE_KEY } from "../../i18n";

























const DARK_MODE_STORAGE_KEY = "app_dark_mode";


/** تنظیم ذخیره‌شده حالت تاریک را می‌خواند و در نبود یا خطا مقدار false را انتخاب می‌کند. */
function readPersistedDarkMode() {
  try {
    return localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
  } catch {

    return false;
  }
}

const initialState = {
  darkMode: readPersistedDarkMode(),
  language: i18n.resolvedLanguage || "fa"
};

/**
 * Slice رابط کاربری زبان و حالت تاریک را به‌صورت سراسری مدیریت می‌کند.
 * هر تغییر علاوه بر Redux در محل مناسب ذخیره می‌شود تا بعد از Refresh باقی بماند.
 */
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


      i18n.changeLanguage(lng);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      } catch {

      }
    }
  }
});

/** مقدار حالت تاریک را در localStorage ذخیره می‌کند و خطاهای محدودیت حافظه را بی‌خطر نادیده می‌گیرد. */
function persistDarkMode(value) {
  try {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(value));
  } catch {

  }
}

export const { toggleDarkMode, setDarkMode, setLanguage } = uiSlice.actions;

export default uiSlice.reducer;
