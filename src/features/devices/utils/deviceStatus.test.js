import {describe, expect, it} from "vitest";

import {
    buildDeviceOpenLoadingKey,
    canOpenDevice,
    getDeviceStatusColor
} from "./deviceStatus";

describe("deviceStatus helpers", () => {
    it("uses stable keys for per-device loading state", () => {
        expect(buildDeviceOpenLoadingKey("device-1", "iframe")).toBe("device-1:iframe");
    });

    it("maps known device states to table tag colors", () => {
        expect(getDeviceStatusColor("active")).toBe("green");
        expect(getDeviceStatusColor("inactive")).toBe("red");
        expect(getDeviceStatusColor("checking")).toBe("gold");
    });

    it("allows opening only active devices when the opposite mode is idle", () => {
        expect(canOpenDevice({
            deviceId: "device-1",
            openMode: "iframe",
            deviceStatuses: {"device-1": "active"},
            deviceActionLoading: {"device-1:direct": false}
        })).toBe(true);

        expect(canOpenDevice({
            deviceId: "device-1",
            openMode: "iframe",
            deviceStatuses: {"device-1": "inactive"},
            deviceActionLoading: {}
        })).toBe(false);

        expect(canOpenDevice({
            deviceId: "device-1",
            openMode: "iframe",
            deviceStatuses: {"device-1": "active"},
            deviceActionLoading: {"device-1:direct": true}
        })).toBe(false);
    });
});
