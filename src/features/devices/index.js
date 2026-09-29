export {default as DeviceFormModal, EMPTY_DEVICE} from "./components/DeviceFormModal";
export {
    buildDeviceBaseUrl,
    changeDevicePassword,
    fetchDeviceInfoByIp,
    fetchDeviceInfoBySerial,
    loginToDevice,
    loginToOnlinePanel,
    resolveDeviceInfo
} from "./api/device.api";
export {
    deleteDevice,
    getEditableDevice,
    getEditableOnlinePanel,
    loadDevices,
    loadOnlinePanel,
    saveDevice,
    saveOnlinePanel,
    updateDeviceMetadata
} from "./storage/device.storage";
