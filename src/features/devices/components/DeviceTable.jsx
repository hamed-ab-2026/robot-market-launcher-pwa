import React, {useMemo} from "react";
import {Button, Empty, Space, Table, Tag, Tooltip} from "antd";
import {DesktopOutlined, LinkOutlined, SettingOutlined} from "@ant-design/icons";

import {buildDeviceBaseUrl} from "../api/device.api";
import {
    buildDeviceOpenLoadingKey,
    canOpenDevice,
    getDeviceStatusColor
} from "../utils/deviceStatus";

/**
 * Renders the device list and keeps table-specific action rules out of the hub page.
 */
export default function DeviceTable({
                                        devices,
                                        deviceStatuses,
                                        deviceActionLoading,
                                        onOpenDevice,
                                        onOpenAdvancedSettings,
                                        t
                                    }) {
    const columns = useMemo(() => [
            {
                title: t("hub.table.device"),
                dataIndex: "name",
                key: "name",
                width: 120,
                render: (name, device) =>
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{name}</div>
                        <div className="mt-1 text-xs text-slate-400" dir="ltr">{buildDeviceBaseUrl(device)}</div>
                    </div>
            },
            {
                title: t("hub.table.serial"),
                dataIndex: "serial",
                key: "serial",
                width: 80,
                render: (serial) => <span dir="ltr">{serial}</span>
            },
            {
                title: t("hub.table.status"),
                key: "status",
                width: 90,
                render: (_, device) => {
                    const status = deviceStatuses[device.id] || "checking";
                    return <Tag color={getDeviceStatusColor(status)}>{t(`hub.deviceStatus.${status}`)}</Tag>;
                }
            },
            {
                title: t("hub.table.actions"),
                key: "actions",
                width: 132,
                render: (_, device) =>
                    <Space size="middle" wrap={false}>
                        <Tooltip title={t("hub.actions.iframe")}>
                            <Button
                                type="text"
                                className="text-lg"
                                icon={<DesktopOutlined/>}
                                loading={deviceActionLoading[buildDeviceOpenLoadingKey(device.id, "iframe")]}
                                disabled={!canOpenDevice({
                                    deviceId: device.id,
                                    openMode: "iframe",
                                    deviceStatuses,
                                    deviceActionLoading
                                })}
                                onClick={() => onOpenDevice(device, "iframe")}/>
                        </Tooltip>
                        <Tooltip title={t("hub.actions.direct")}>
                            <Button
                                type="text"
                                className="text-lg"
                                icon={<LinkOutlined/>}
                                loading={deviceActionLoading[buildDeviceOpenLoadingKey(device.id, "direct")]}
                                disabled={!canOpenDevice({
                                    deviceId: device.id,
                                    openMode: "direct",
                                    deviceStatuses,
                                    deviceActionLoading
                                })}
                                onClick={() => onOpenDevice(device, "direct")}/>
                        </Tooltip>
                        <Tooltip title={t("hub.actions.advancedSettings")}>
                            <Button
                                type="text"
                                className="text-lg"
                                icon={<SettingOutlined/>}
                                onClick={() => onOpenAdvancedSettings(device)}/>
                        </Tooltip>
                    </Space>
            }],
        [deviceActionLoading, deviceStatuses, onOpenAdvancedSettings, onOpenDevice, t]);

    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={devices}
            pagination={false}
            tableLayout="fixed"
            scroll={{x: 422}}
            locale={{emptyText: <Empty description={t("hub.emptyDevices")}/>}}/>
    );
}
