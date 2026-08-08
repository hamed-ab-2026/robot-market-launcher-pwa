import { api } from "./axiosConfig";

// -----------------------------------------------------------------------
// EN: "Modular API" layer — components and Redux thunks call these
//     functions instead of using `api.get(...)` directly. If the backend
//     URL shape ever changes, this is the ONLY file that needs editing.
// FA: لایه "API ماژولار" — کامپوننت‌ها و thunk های رداکس این توابع را
//     صدا می‌زنند، نه مستقیماً api.get را. اگر شکل URL بک‌اند تغییر کند،
//     فقط همین فایل نیاز به ویرایش دارد.
// -----------------------------------------------------------------------

/**
 * EN: Fetches the dashboard overview (stats + device list) for the
 *     currently connected device.
 * FA: آمار کلی داشبورد (آمار + لیست دستگاه‌ها) را برای دستگاه متصل‌شده
 *     فعلی دریافت می‌کند.
 *
 * @param {{ connectionType: 'online'|'offline'|null, address: string|null }} params
 */
export async function fetchDeviceOverview({ connectionType, address } = {}) {
  const response = await api.get("/device/overview", {
    params: { connectionType, address }
  });
  return response.data;
}

/**
 * EN: Pings a manually-entered IP/URL to confirm it's reachable before
 *     navigating to the dashboard (used by the Main Hub connect forms).
 * FA: یک IP/URL واردشده را برای اطمینان از در دسترس بودن، قبل از رفتن
 *     به داشبورد، پینگ می‌کند (در فرم‌های اتصال Main Hub استفاده می‌شود).
 */
export async function pingDevice(address) {
  const response = await api.get("/device/ping", { params: { address } });
  return response.data;
}
