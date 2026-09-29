import apiClient from "../../../services/api/client";


const MOCK_DELAY_MS = 700;


function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


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
    const {data} = await apiClient.get(url, {headers: {"Cache-Control": "no-cache"}});
    const result = normalizeDeviceResponse(data);
    if (!result.ipAddress && !result.plateSerial && !result.type) {
        throw new Error("INVALID_DEVICE_INFO");
    }
    return result;
}


export function fetchDeviceInfoBySerial(serial) {
    const normalizedSerial = normalizeSerial(serial);
    if (!/^[a-z0-9-]+$/i.test(normalizedSerial)) throw new Error("INVALID_SERIAL");
    return requestDeviceInfo(`http://${normalizedSerial}.local/api/getdevice`);
}


export function fetchDeviceInfoByIp(ipAddress) {
    const normalizedIp = String(ipAddress || "")
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "");
    if (!normalizedIp) throw new Error("IP_REQUIRED");
    return requestDeviceInfo(`http://${normalizedIp}/api/getdevice`);
}


function serialsMatch(firstSerial, secondSerial) {
    return normalizeSerial(firstSerial).toUpperCase() === normalizeSerial(secondSerial).toUpperCase();
}


export async function resolveDeviceInfo({serial, ipAddress}) {
    if (ipAddress) {
        try {
            const infoFromIp = await fetchDeviceInfoByIp(ipAddress);
            if (serialsMatch(infoFromIp.plateSerial, serial)) {
                return {...infoFromIp, source: "ip"};
            }
        } catch {
            // در صورت خطا، استعلام از mDNS ادامه پیدا می‌کند.
        }
    }

    const infoFromMdns = await fetchDeviceInfoBySerial(serial);
    return {...infoFromMdns, source: "mdns"};
}


export async function loginToDevice({baseUrl, username, password}) {
    const {data} = await apiClient.post(`${baseUrl}/api/login`, {username, password});
    return data;
}


export async function changeDevicePassword({baseUrl, username, oldPassword, newPassword}) {
    const {data} = await apiClient.post(`${baseUrl}/api/change-password`, {
        username,
        oldPassword,
        newPassword
    });
    return data;
}


/**
 * جایگزین موقت API پنل ابری؛ این مرز را حفظ می‌کند تا با آماده‌شدن backend
 * فقط همین تابع تغییر کند و UI دست‌نخورده بماند.
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
