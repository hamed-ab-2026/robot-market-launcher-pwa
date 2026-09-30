/**
 * Builds the stable loading-state key used for a specific device open action.
 */
export function buildDeviceOpenLoadingKey(deviceId, openMode) {
    return `${deviceId}:${openMode}`;
}

/**
 * Maps a device availability state to the Ant Design tag color shown in tables.
 */
export function getDeviceStatusColor(status) {
    if (status === "active") return "green";
    if (status === "inactive") return "red";
    return "gold";
}

/**
 * A device panel can be opened only after the latest health check marks it active
 * and the opposite open mode is not already running for the same device.
 */
export function canOpenDevice({deviceId, openMode, deviceStatuses, deviceActionLoading}) {
    const oppositeMode = openMode === "iframe" ? "direct" : "iframe";
    const oppositeKey = buildDeviceOpenLoadingKey(deviceId, oppositeMode);

    return deviceStatuses[deviceId] === "active" && !deviceActionLoading[oppositeKey];
}
