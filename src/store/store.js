import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import deviceReducer from "./slices/deviceSlice";

// -----------------------------------------------------------------------
// EN: We deliberately did NOT add `redux-persist` here. Only a handful of
//     fields need to survive a refresh (dark mode, language, passcode
//     hash, unlock-attempt lockout) and each of those already persists
//     itself directly to localStorage inside its own slice (see
//     uiSlice.js / authSlice.js). This keeps the store simple and avoids
//     redux-persist's extra boilerplate (PersistGate, rehydration
//     actions, etc.) for junior developers to learn.
// FA: عمداً از redux-persist استفاده نکردیم. فقط چند فیلد نیاز به ماندگاری
//     بین رفرش‌ها دارند (حالت تیره، زبان، هش رمز عبور) و هرکدام مستقیماً
//     داخل اسلایس خودشان در localStorage ذخیره می‌شوند. این باعث می‌شود
//     استور ساده بماند و توسعه‌دهندگان جونیور نیازی به یادگیری
//     پیچیدگی‌های اضافه redux-persist نداشته باشند.
// -----------------------------------------------------------------------

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    device: deviceReducer
  },
  // Default middleware (thunk + serializable/immutable checks) is fine for
  // this app's size — no custom middleware needed yet.
  devTools: import.meta.env.MODE !== "production"
});

export default store;
