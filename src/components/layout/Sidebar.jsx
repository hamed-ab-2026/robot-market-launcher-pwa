import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  BarChartOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import RobotMascot from "../common/RobotMascot";
import { lockSession } from "../../store/slices/authSlice";
import { clearConnection } from "../../store/slices/deviceSlice";

// -----------------------------------------------------------------------
// EN: Desktop-only sidebar (hidden below the `lg` breakpoint — see the
//     `hidden lg:flex` className below). Mobile uses MobileDrawer.jsx
//     instead. Nav items + order match the reference exactly: Dashboard,
//     Orders, Devices, Customers, Reports, Messages, Settings, then a
//     separated Logout button at the very bottom.
// FA: نوار کناری فقط برای دسکتاپ. آیتم‌های ناوبری دقیقاً مطابق طرح مرجع:
//     داشبورد، سفارش‌ها، دستگاه‌ها، مشتریان، گزارش‌ها، پیام‌ها، تنظیمات،
//     و دکمه خروج جدا در انتها.
// -----------------------------------------------------------------------

export const NAV_ITEMS = [
  { key: "dashboard", icon: AppstoreOutlined, labelKey: "sidebar.dashboard" },
  { key: "orders", icon: ShoppingCartOutlined, labelKey: "sidebar.orders" },
  { key: "devices", icon: DeploymentUnitOutlined, labelKey: "sidebar.devices" },
  { key: "customers", icon: TeamOutlined, labelKey: "sidebar.customers" },
  { key: "reports", icon: BarChartOutlined, labelKey: "sidebar.reports" },
  { key: "messages", icon: MessageOutlined, labelKey: "sidebar.messages" },
  { key: "settings", icon: SettingOutlined, labelKey: "sidebar.settings" }
];

export default function Sidebar({ activeKey = "dashboard" }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(lockSession());
    dispatch(clearConnection());
    navigate("/auth", { replace: true });
  }

  return (
    <aside className="hidden w-64 flex-none flex-col border-e border-slate-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 lg:flex">
      <div className="mb-8 flex flex-col items-center gap-2 px-1 text-center">
        <RobotMascot variant="mark" className="h-10 w-10" />
        <span className="font-bold text-slate-800 dark:text-white">{t("app.name")}</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            type="button"
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              activeKey === key
                ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
            ].join(" ")}
          >
            <Icon className="text-base" />
            {t(labelKey)}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:bg-slate-700/40 dark:text-slate-300 dark:hover:bg-red-900/20"
      >
        {t("sidebar.logout")}
        <LogoutOutlined />
      </button>
    </aside>
  );
}
