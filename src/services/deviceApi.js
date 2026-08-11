const MOCK_DELAY_MS = 700;


/** یک Promise زمان‌دار می‌سازد تا تأخیر طبیعی شبکه در API آزمایشی شبیه‌سازی شود. */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
 * آدرس پایه دستگاه را از مدل اتصال می‌سازد.
 * در DHCP شماره سریال به hostname با پسوند local تبدیل می‌شود و در حالت ثابت IP واردشده استفاده می‌شود.
 */
export function buildDeviceBaseUrl(device) {
  if (device.connectionMode === "dhcp") {
    return `http://${device.serial.trim()}.local`;
  }
  return `http://${device.ipAddress.trim()}`;
}







/**
 * فعلاً دریافت مشخصات دستگاه از firmware را شبیه‌سازی می‌کند و اطلاعات استاندارد برمی‌گرداند.
 * پس از آماده شدن API، بخش TODO باید با درخواست واقعی به مسیر /api/getdevice جایگزین شود.
 */
export async function fetchDeviceInfo(device) {
  await wait(MOCK_DELAY_MS);

  return {
    name: device.name,
    serial: device.serial,
    type: device.type || "robot",
    ipAddress: device.ipAddress || "",
    baseUrl: buildDeviceBaseUrl(device),
    status: "unknown"
  };
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
