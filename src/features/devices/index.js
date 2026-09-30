export {default as DeviceFormModal, EMPTY_DEVICE} from "./components/DeviceFormModal";
export {default as DeviceTable} from "./components/DeviceTable";
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
export {
    buildDeviceOpenLoadingKey,
    canOpenDevice,
    getDeviceStatusColor
} from "./utils/deviceStatus";
