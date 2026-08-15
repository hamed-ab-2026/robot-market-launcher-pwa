const MOCK_DELAY_MS = 700;
const DEVICE_REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT) || 10_000;


/**
 * TODO: بعد از آماده‌شدن API، لیست ثابت زیر با درخواست واقعی دریافت انواع دستگاه جایگزین شود.
 * خروجی API باید حداقل شامل id و name باشد تا بدون تغییر فرم قابل استفاده باشد.
 */
export async function fetchDeviceTypes() {
  return [
    {
      id: "cold-vending",
      name: "دستگاه وندینگ سرد"
    }
  ];
}


/** یک Promise زمان‌دار می‌سازد تا تأخیر طبیعی شبکه در API آزمایشی شبیه‌سازی شود. */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
 * آدرس پایه دستگاه را از مدل اتصال می‌سازد.
 * در DHCP شماره سریال به hostname با پسوند local تبدیل می‌شود و در حالت ثابت IP واردشده استفاده می‌شود.
 */
export function buildDeviceBaseUrl(device) {
  if (device.ipAddress?.trim()) {
    return `http://${device.ipAddress.trim()}`;
  }
  return `http://${normalizeSerial(device.serial)}.local`;
}


function normalizeSerial(serial) {
  return String(serial || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\.local(?:\/.*)?$/i, "");
}


function normalizeDeviceResponse(payload = {}) {
  return {
    installationLocation: payload.installationLocation ?? payload.installation_location ?? payload.location ?? payload.install_location ?? "",
    ipAddress: payload.localIp ?? payload.localIP ?? payload.local_ip ?? payload.ipAddress ?? payload.ip_address ?? payload.ip ?? "",
    type: payload.deviceType ?? payload.device_type ?? payload.type ?? "",
    plateSerial: payload.plateSerial ?? payload.plate_serial ?? payload.serialPlate ?? payload.plate ?? payload.serial ?? ""
  };
}


async function requestDeviceInfo(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEVICE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`DEVICE_INFO_${response.status}`);

    const result = normalizeDeviceResponse(await response.json());
    if (!result.ipAddress && !result.plateSerial && !result.type) {
      throw new Error("INVALID_DEVICE_INFO");
    }
    return result;
  } finally {
    window.clearTimeout(timeout);
  }
}


/** دستگاه را از طریق mDNS و شماره سریال پیدا می‌کند و IP فعلی آن را برمی‌گرداند. */
export function fetchDeviceInfoBySerial(serial) {
  const normalizedSerial = normalizeSerial(serial);
  if (!/^[a-z0-9-]+$/i.test(normalizedSerial)) throw new Error("INVALID_SERIAL");
  return requestDeviceInfo(`http://${normalizedSerial}.local/api/getdevice`);
}


/** برای بررسی وضعیت، مستقیماً از IP ذخیره‌شده مشخصات دستگاه را درخواست می‌کند. */
export function fetchDeviceInfoByIp(ipAddress) {
  const normalizedIp = String(ipAddress || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
  if (!normalizedIp) throw new Error("IP_REQUIRED");
  return requestDeviceInfo(`http://${normalizedIp}/api/getdevice`);
}







/**
 * فعلاً ورود به پنل ابری را شبیه‌سازی می‌کند تا رابط کاربری مستقل از API قابل تست باشد.
 * بعداً نام کاربری و رمز باید در همین نقطه به سرویس احراز هویت واقعی ارسال شوند.
 */
export async function loginToOnlinePanel(credentials) {
  await wait(MOCK_DELAY_MS);
  return {
    ok: true,
    username: credentials.username,
    token: null,
    redirectUrl: "https://panel.my-rm.com/login"
  };
}
