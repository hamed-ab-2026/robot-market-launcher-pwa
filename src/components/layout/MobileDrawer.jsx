import React from "react";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";

import { toggleSidebar, closeSidebar } from "../../store/slices/uiSlice";
import { lockSession } from "../../store/slices/authSlice";
import { clearConnection } from "../../store/slices/deviceSlice";
import { NAV_ITEMS } from "./Sidebar";

// -----------------------------------------------------------------------
// EN: Mobile equivalent of Sidebar.jsx, shown as a right-side Drawer
//     (which naturally becomes a LEFT drawer under RTL, since AntD's
//     Drawer respects ConfigProvider's `direction` — no extra logic
//     needed here). Reuses NAV_ITEMS from Sidebar.jsx so both stay in
//     sync automatically.
// FA: معادل موبایل Sidebar.jsx، به‌صورت Drawer از سمت راست (که به‌طور
//     خودکار زیر RTL به سمت چپ تبدیل می‌شود چون Drawer آنت‌دیزاین از
//     جهت ConfigProvider پیروی می‌کند). از همان NAV_ITEMS استفاده می‌کند.
// -----------------------------------------------------------------------

export default function MobileDrawer({ activeKey = "dashboard" }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.ui.isSidebarOpen);

  function handleLogout() {
    dispatch(closeSidebar());
    dispatch(lockSession());
    dispatch(clearConnection());
    navigate("/auth", { replace: true });
  }

  return (
    <Drawer
      open={isOpen}
      onClose={() => dispatch(toggleSidebar())}
      placement="end" // "end" = right in LTR, left in RTL — matches document direction automatically
      width={280}
      closeIcon={null}
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
            R
          </div>
          <span className="font-bold">{t("app.shortName")}</span>
        </div>
      }
    >
      <nav className="space-y-1 p-4">
        {NAV_ITEMS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => dispatch(closeSidebar())}
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              activeKey === key
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
            ].join(" ")}
          >
            <Icon className="text-base" />
            {t(labelKey)}
          </button>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogoutOutlined />
          {t("sidebar.logout")}
        </button>
      </nav>
    </Drawer>
  );
}
