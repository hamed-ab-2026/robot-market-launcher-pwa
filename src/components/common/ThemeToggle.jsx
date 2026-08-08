import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { toggleDarkMode } from "../../store/slices/uiSlice";
import { useTranslation } from "react-i18next";

// -----------------------------------------------------------------------
// EN: A single toggle button reused across every screen's header. It only
//     ever dispatches `toggleDarkMode` — the actual class-swapping side
//     effect lives in hooks/useDarkMode.js so there's exactly one place
//     that touches the DOM directly.
// FA: یک دکمه تک برای تغییر حالت که در هدر همه صفحات استفاده می‌شود. فقط
//     toggleDarkMode را دیسپچ می‌کند — منطق تغییر کلاس DOM در
//     hooks/useDarkMode.js است تا فقط یک جا با DOM کار مستقیم داشته باشیم.
// -----------------------------------------------------------------------
export default function ThemeToggle() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const darkMode = useSelector((state) => state.ui.darkMode);

  return (
    <button
      type="button"
      aria-label={darkMode ? t("common.lightMode") : t("common.darkMode")}
      onClick={() => dispatch(toggleDarkMode())}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500"
    >
      {darkMode ? <SunOutlined /> : <MoonOutlined />}
    </button>
  );
}
