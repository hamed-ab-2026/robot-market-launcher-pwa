import { decryptSecret, encryptSecret } from "../utils/crypto";

const DEVICES_KEY = "robot_hub_devices";
const ONLINE_PANEL_KEY = "robot_hub_online_panel";


/**
 * یک مقدار JSON را با مدیریت خطا از localStorage می‌خواند.
 * اگر داده وجود نداشته باشد یا خراب باشد، مقدار fallback برگردانده می‌شود تا صفحه از کار نیفتد.
 */
function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}


/** فهرست دستگاه‌های ذخیره‌شده را می‌خواند و در اولین اجرا آرایه خالی تحویل می‌دهد. */
export function loadDevices() {
  return readJson(DEVICES_KEY, []);
}


/**
 * دستگاه جدید را ایجاد یا دستگاه قبلی را بر اساس id ویرایش می‌کند.
 * اطلاعات عمومی خوانا باقی می‌مانند، اما رمز پیش از ذخیره رمزنگاری و مقدار خام از رکورد حذف می‌شود.
 */
export async function saveDevice(device) {
  const devices = loadDevices();
  const record = {
    ...device,
    id: device.id || crypto.randomUUID(),
    encryptedPassword: await encryptSecret(device.password),
    password: undefined,
    updatedAt: new Date().toISOString()
  };
  const index = devices.findIndex((item) => item.id === record.id);
  const nextDevices = index === -1 ?
  [...devices, record] :
  devices.map((item) => item.id === record.id ? record : item);

  localStorage.setItem(DEVICES_KEY, JSON.stringify(nextDevices));
  return record;
}


/** دستگاه دارای شناسه مشخص را حذف و نسخه جدید آرایه دستگاه‌ها را دوباره ذخیره می‌کند. */
export function deleteDevice(deviceId) {
  localStorage.setItem(
    DEVICES_KEY,
    JSON.stringify(loadDevices().filter((device) => device.id !== deviceId))
  );
}


/**
 * رکورد ذخیره‌شده دستگاه را برای فرم ویرایش آماده می‌کند.
 * در این مرحله رمز رمزگشایی می‌شود تا کاربر بتواند مقدار قبلی را ببیند یا تغییر دهد.
 */
export async function getEditableDevice(device) {
  return {
    ...device,
    password: await decryptSecret(device.encryptedPassword)
  };
}


/** اطلاعات ذخیره‌شده پنل آنلاین را همراه با رمز رمزنگاری‌شده آن می‌خواند. */
export function loadOnlinePanel() {
  return readJson(ONLINE_PANEL_KEY, { username: "", encryptedPassword: "" });
}


/** نام کاربری پنل را عادی و رمز را به‌صورت AES-GCM در localStorage ذخیره می‌کند. */
export async function saveOnlinePanel({ username, password }) {
  const record = {
    username,
    encryptedPassword: await encryptSecret(password),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(ONLINE_PANEL_KEY, JSON.stringify(record));
  return record;
}


/** اطلاعات پنل آنلاین را می‌خواند و رمز را برای نمایش داخل مودال رمزگشایی می‌کند. */
export async function getEditableOnlinePanel() {
  const record = loadOnlinePanel();
  return {
    username: record.username || "",
    password: await decryptSecret(record.encryptedPassword)
  };
}
