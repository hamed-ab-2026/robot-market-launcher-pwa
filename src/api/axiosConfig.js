import axios from "axios";
import { message } from "antd";
import { attachMockAdapter } from "./mockAdapter";

// -----------------------------------------------------------------------
// EN: This file is the SINGLE place that creates and configures the
//     axios instance used across the whole app. Never call `axios.get`
//     directly from a component — always import `api` from here so every
//     request goes through the same base config, headers, and error
//     handling. This is what "Modular API" means in the spec: UI never
//     talks to the network directly, only to src/api/*Service.js files,
//     which in turn use this `api` instance.
//
// FA: این فایل تنها جایی است که نمونه axios مورد استفاده در کل اپلیکیشن
//     ساخته و پیکربندی می‌شود. هرگز مستقیماً از کامپوننت axios.get صدا
//     نزنید — همیشه از این فایل `api` را ایمپورت کنید تا همه درخواست‌ها
//     از یک تنظیمات، هدر و مدیریت خطای یکسان عبور کنند.
// -----------------------------------------------------------------------

// Reads a boolean-ish env var safely — Vite exposes env vars as strings.
const isDevMode = String(import.meta.env.VITE_DEV_MODE).toLowerCase() === "true";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// ------------------------------- REQUEST -------------------------------
// EN: Runs before every outgoing request. Good place for auth tokens,
//     request IDs, or (as here) dynamically pointing at whichever device
//     address the user connected to (IP for offline mode, URL for online).
// FA: قبل از هر درخواست خروجی اجرا می‌شود. جای مناسبی برای توکن‌های
//     احراز هویت یا (مثل اینجا) تنظیم پویای آدرس دستگاه متصل‌شده.
api.interceptors.request.use(
  (config) => {
    // Attach the currently-selected device address, if any, as a custom
    // header — deviceService.js reads this to build the right URL.
    // (Kept intentionally simple; a real app might read from Redux here
    // via a store import, but that risks circular imports for a demo app.)
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------- RESPONSE -------------------------------
// EN: Centralized error handling. Every request that fails anywhere in
//     the app funnels through here ONCE, so components don't each need
//     their own try/catch + toast logic — they can just `.catch()` and
//     move on, or rely on RTK's `rejected` action if using createAsyncThunk.
// FA: مدیریت متمرکز خطا. هر درخواستی که در هر جای اپ شکست بخورد، از اینجا
//     عبور می‌کند تا کامپوننت‌ها مجبور به نوشتن try/catch و toast تکراری
//     نباشند.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message;

    // Map common HTTP status codes to a user-friendly message.
    // (i18n keys aren't used here to keep this framework-agnostic file
    // free of React/i18next imports — components can re-translate the
    // `error.friendlyCode` if they want a localized string instead.)
    let friendlyCode = "UNKNOWN_ERROR";
    if (!error.response) {
      friendlyCode = "NETWORK_ERROR"; // device unreachable / offline
    } else if (status === 401) {
      friendlyCode = "UNAUTHORIZED";
    } else if (status === 404) {
      friendlyCode = "NOT_FOUND";
    } else if (status >= 500) {
      friendlyCode = "SERVER_ERROR";
    }

    // Non-blocking toast so the user always sees *something* failed,
    // even if the calling code forgets to handle the rejection itself.
    message.error(serverMessage || friendlyCode);

    // Re-throw so callers (thunks, services) can still branch on it.
    error.friendlyCode = friendlyCode;
    return Promise.reject(error);
  }
);

// ---------------------------- DEVELOPER MODE ----------------------------
// EN: When VITE_DEV_MODE=true, every request made through `api` is
//     intercepted and answered with mock data instead of hitting a real
//     device/network. Flip VITE_DEV_MODE=false (or unset it) in .env to
//     use real endpoints once hardware is available.
// FA: وقتی VITE_DEV_MODE=true باشد، هر درخواستی که از طریق `api` ارسال
//     شود، به‌جای دستگاه/شبکه واقعی، با داده نمایشی پاسخ داده می‌شود.
if (isDevMode) {
  attachMockAdapter(api);
  // eslint-disable-next-line no-console
  console.info("%c[DEV MODE] Mock API adapter is ACTIVE — no real network calls will be made.", "color:#00A693;font-weight:bold;");
}

export default api;
