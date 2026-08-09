import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
















/**
 * Store مرکزی Redux را از Slice احراز هویت و تنظیمات رابط کاربری می‌سازد.
 * DevTools در نسخه Production خاموش است تا حجم و سطح مشاهده اطلاعات داخلی کاهش پیدا کند.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer
  },


  devTools: import.meta.env.MODE !== "production"
});

export default store;
