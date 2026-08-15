import {decryptSecret, encryptSecret} from "../utils/crypto";

const DEVICES_KEY = "robot_hub_devices";
const ONLINE_PANEL_KEY = "robot_hub_online_panel";


function readJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}


export function loadDevices() {
    return readJson(DEVICES_KEY, []);
}


export async function saveDevice(device) {
    const devices = loadDevices();
    const encryptedPassword = device.password === undefined ?
        (device.encryptedPassword || "") :
        await encryptSecret(device.password);
    const record = {
        ...device,
        id: device.id || crypto.randomUUID(),
        encryptedPassword,
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


export function updateDeviceMetadata(deviceId, changes) {
    const nextDevices = loadDevices().map((device) => device.id === deviceId ? {
        ...device,
        ...changes,
        updatedAt: new Date().toISOString()
    } : device);
    localStorage.setItem(DEVICES_KEY, JSON.stringify(nextDevices));
    return nextDevices.find((device) => device.id === deviceId) || null;
}


export function deleteDevice(deviceId) {
    localStorage.setItem(
        DEVICES_KEY,
        JSON.stringify(loadDevices().filter((device) => device.id !== deviceId))
    );
}


export async function getEditableDevice(device) {
    return {
        ...device,
        password: await decryptSecret(device.encryptedPassword)
    };
}


export function loadOnlinePanel() {
    return readJson(ONLINE_PANEL_KEY, {username: "", encryptedPassword: ""});
}


export async function saveOnlinePanel({username, password}) {
    const record = {
        username,
        encryptedPassword: await encryptSecret(password),
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(ONLINE_PANEL_KEY, JSON.stringify(record));
    return record;
}


export async function getEditableOnlinePanel() {
    const record = loadOnlinePanel();
    return {
        username: record.username || "",
        password: await decryptSecret(record.encryptedPassword)
    };
}
