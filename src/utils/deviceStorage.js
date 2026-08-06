const STORAGE_KEY = "rm_local_device_ip";
const DEFAULT_IP = "192.168.4.1";

/**
 * Returns the saved local device IP, or the default value
 * if nothing has been saved yet.
 */
export function getLocalDeviceIp() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && saved.trim() ? saved.trim() : DEFAULT_IP;
  } catch {
    return DEFAULT_IP;
  }
}

/**
 * Persists the local device IP to localStorage.
 */
export function setLocalDeviceIp(ip) {
  const value = ip && ip.trim() ? ip.trim() : DEFAULT_IP;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage may be unavailable (e.g. private mode) — fail silently,
    // the app still works with the in-memory value for this session.
  }
  return value;
}

export function buildDeviceUrl(ip) {
  return `http://${ip}/`;
}

export { DEFAULT_IP };
