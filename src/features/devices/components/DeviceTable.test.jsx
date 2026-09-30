import React from "react";
import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";

import DeviceTable from "./DeviceTable";

const t = (key) => key;

describe("DeviceTable", () => {
    it("renders device identity and translated status", () => {
        render(
            <DeviceTable
                devices={[{id: "device-1", name: "Robot One", serial: "RM-100", ipAddress: "192.168.1.10"}]}
                deviceStatuses={{"device-1": "active"}}
                deviceActionLoading={{}}
                onOpenDevice={vi.fn()}
                onOpenAdvancedSettings={vi.fn()}
                t={t}/>
        );

        expect(screen.getByText("Robot One")).toBeInTheDocument();
        expect(screen.getByText("RM-100")).toBeInTheDocument();
        expect(screen.getByText("hub.deviceStatus.active")).toBeInTheDocument();
    });

    it("disables open actions when the device is not active", () => {
        render(
            <DeviceTable
                devices={[{id: "device-1", name: "Robot One", serial: "RM-100"}]}
                deviceStatuses={{"device-1": "inactive"}}
                deviceActionLoading={{}}
                onOpenDevice={vi.fn()}
                onOpenAdvancedSettings={vi.fn()}
                t={t}/>
        );

        const actionButtons = screen.getAllByRole("button");

        expect(actionButtons[0]).toBeDisabled();
        expect(actionButtons[1]).toBeDisabled();
        expect(actionButtons[2]).not.toBeDisabled();
    });
});
