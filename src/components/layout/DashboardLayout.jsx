import React from "react";
import { useDispatch } from "react-redux";
import { Input } from "antd";
import { MenuOutlined, SearchOutlined, BellOutlined, MessageOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeToggle from "../common/ThemeToggle";
import { toggleSidebar } from "../../store/slices/uiSlice";

// -----------------------------------------------------------------------
// EN: Shared page shell for every authenticated screen, redesigned to
//     match the reference header exactly: a rounded search pill, small
//     circular notification/chat icon buttons, and a greeting with the
//     current time-of-day-style wave emoji + subtitle. Sidebar sits on
//     the reading-start side and flips automatically under RTL/LTR
//     because it's simply the first flex child.
// FA: پوسته مشترک صفحات احراز هویت‌شده، بازطراحی‌شده تا دقیقاً مطابق
//     هدر طرح مرجع باشد: نوار جستجوی گرد، دکمه‌های دایره‌ای کوچک
//     اعلان/چت، و پیام خوش‌آمدگویی با ایموجی دست‌تکان‌دهنده + زیرعنوان.
// -----------------------------------------------------------------------

export default function DashboardLayout({ title, activeKey, userName, children }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const displayName = userName || t("header.defaultUserName");

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar activeKey={activeKey} />
      <MobileDrawer activeKey={activeKey} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* --- Header: matches the reference's search + icons + greeting row --- */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-5 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              aria-label={t("sidebar.dashboard")}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 lg:hidden"
            >
              <MenuOutlined />
            </button>

            <IconButton ariaLabel="notifications">
              <BellOutlined />
            </IconButton>
            <IconButton ariaLabel="messages">
              <MessageOutlined />
            </IconButton>

            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder={t("header.searchPlaceholder")}
              className="hidden w-56 rounded-full bg-slate-50 sm:block"
              variant="borderless"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-end">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {t("header.greeting", { name: displayName })} 👋
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t("header.welcome")}</p>
            </div>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

/** EN: Small circular icon button, matching the reference's notification/chat buttons. FA: دکمه دایره‌ای کوچک، مطابق دکمه‌های اعلان/چت طرح مرجع. */
function IconButton({ children, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-brand-900/30"
    >
      {children}
    </button>
  );
}
