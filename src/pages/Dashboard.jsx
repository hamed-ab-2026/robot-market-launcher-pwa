import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Table, Tag, Button, Progress } from "antd";
import { WifiOutlined, RobotOutlined, ThunderboltOutlined, WarningOutlined, ReloadOutlined } from "@ant-design/icons";

import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import DeviceStatusBadge from "../components/dashboard/DeviceStatusBadge";
import SalesChart from "../components/dashboard/SalesChart";
import DeviceStatusDonut from "../components/dashboard/DeviceStatusDonut";
import RecentActivity from "../components/dashboard/RecentActivity";
import { fetchOverview } from "../store/slices/deviceSlice";
import { formatNumberByLocale } from "../utils/numbers";

// -----------------------------------------------------------------------
// EN: The main management screen, recomposed to match the reference's
//     card arrangement top-to-bottom:
//       1. Sales chart (full width)
//       2. Active devices donut + Recent activity, side by side
//       3. KPI stat row + device table — kept from the original spec's
//          "hardware management" requirement; the reference concept
//          doesn't show this section, but a device-fleet dashboard
//          needs a concrete device list, so it's styled with the same
//          rounded-3xl card language as everything above it.
// FA: صفحه اصلی مدیریت، با چیدمان کارت‌های طرح مرجع از بالا به پایین:
//       ۱. نمودار فروش (تمام عرض)
//       ۲. دونات دستگاه‌های فعال + فعالیت‌های اخیر، کنار هم
//       ۳. ردیف آمار + جدول دستگاه‌ها — طبق نیازمندی اصلی "مدیریت
//          سخت‌افزار"، با همان زبان طراحی کارت‌های بالا.
// -----------------------------------------------------------------------

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const lang = i18n.resolvedLanguage;

  const { overview, status, address, connectionType } = useSelector((state) => state.device);
  const isDevMode = String(import.meta.env.VITE_DEV_MODE).toLowerCase() === "true";

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  const columns = [
    {
      title: t("dashboard.table.name"),
      dataIndex: "name",
      key: "name",
      render: (name) => <span className="font-medium text-slate-700 dark:text-slate-200">{name}</span>
    },
    {
      title: t("dashboard.table.ip"),
      dataIndex: "ip",
      key: "ip",
      render: (ip) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{ip}</span>
    },
    {
      title: t("dashboard.table.battery"),
      dataIndex: "battery",
      key: "battery",
      render: (battery) => (
        <Progress percent={battery} size="small" strokeColor={battery < 20 ? "#ef4444" : "#00A693"} className="w-28" />
      )
    },
    {
      title: t("dashboard.table.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => <DeviceStatusBadge status={status} />
    },
    {
      title: t("dashboard.table.lastSeen"),
      dataIndex: "lastSeen",
      key: "lastSeen",
      render: (lastSeen) => <span className="text-xs text-slate-500 dark:text-slate-400">{lastSeen}</span>
    }
  ];

  return (
    <DashboardLayout title={t("dashboard.title")} activeKey="dashboard">
      <div className="space-y-5">
        {/* --- Connected device banner --- */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-brand-200 bg-brand-50 px-5 py-3 dark:border-brand-800 dark:bg-brand-900/20">
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t("dashboard.connectedDevice")}: </span>
            <span className="font-mono font-semibold text-brand-700 dark:text-brand-300">{address || "—"}</span>
            {connectionType && (
              <Tag color="cyan" className="ms-2">
                {connectionType === "online" ? t("hub.onlinePanel.title") : t("hub.offlinePanel.title")}
              </Tag>
            )}
            {isDevMode && (
              <Tag color="gold" className="ms-2">
                {t("dashboard.mockBadge")}
              </Tag>
            )}
          </div>
          <Button icon={<ReloadOutlined />} loading={status === "loading"} onClick={() => dispatch(fetchOverview())}>
            {t("dashboard.refresh")}
          </Button>
        </div>

        {/* --- Sales chart: full width, matches the reference's top card --- */}
        <SalesChart data={overview.salesTrend} />

        {/* --- Active devices donut + Recent activity, side by side --- */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DeviceStatusDonut breakdown={overview.deviceStatusBreakdown} />
          <RecentActivity items={overview.recentActivity} />
        </div>

        {/* --- KPI row --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<WifiOutlined />} label={t("dashboard.stats.onlineDevices")} value={formatNumberByLocale(overview.onlineDevices, lang)} accent="brand" />
          <StatCard icon={<RobotOutlined />} label={t("dashboard.stats.activeRobots")} value={formatNumberByLocale(overview.activeRobots, lang)} accent="blue" />
          <StatCard icon={<ThunderboltOutlined />} label={t("dashboard.stats.batteryAvg")} value={`${formatNumberByLocale(overview.batteryAvg, lang)}%`} accent="amber" />
          <StatCard icon={<WarningOutlined />} label={t("dashboard.stats.alerts")} value={formatNumberByLocale(overview.alerts, lang)} accent="red" />
        </div>

        {/* --- Device table --- */}
        <div className="rounded-3xl border border-slate-100 bg-white p-1 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
          <h2 className="px-4 pt-4 text-sm font-bold text-slate-800 dark:text-white">{t("dashboard.deviceList")}</h2>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={overview.devices}
            loading={status === "loading"}
            pagination={{ pageSize: 5 }}
            className="mt-2"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
