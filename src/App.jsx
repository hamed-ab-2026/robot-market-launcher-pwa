import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTranslation } from "react-i18next";

import AppRouter from "./routes/AppRouter";
import InstallGate from "./pages/InstallGate";
import { useDarkMode } from "./hooks/useDarkMode";
import { useIsStandalone } from "./hooks/useIsStandalone";
import { lockSession } from "./store/slices/authSlice";

// -----------------------------------------------------------------------
// EN: App.jsx is the composition root:
//       1. Keeps the <html> `dark` class in sync (useDarkMode)
//       2. Checks PWA standalone mode via useIsStandalone(), and — this
//          is the fix — gates rendering RIGHT HERE: if the app is not
//          running standalone, App.jsx renders <InstallGate/> directly
//          and never mounts <AppRouter/> at all. The router, splash
//          screen, and every protected page simply don't exist yet for
//          a browser-tab visitor; there's no route to fall back into.
//       3. Feeds Ant Design's ConfigProvider our brand color + RTL
//          direction + dark algorithm, so EVERY AntD component (Table,
//          Modal, Drawer, etc.) automatically matches our Tailwind theme
//          without per-component overrides.
//       4. Locks the session again if the tab was hidden for a while —
//          a lightweight "auto-lock" security behavior for a hardware
//          control panel.
// FA: App.jsx ریشه ترکیب اپلیکیشن است:
//       ۱. کلاس dark روی <html> را هماهنگ نگه می‌دارد
//       ۲. حالت standalone را با useIsStandalone() بررسی می‌کند — و این
//          همان اصلاح است: رندر شدن دقیقاً همین‌جا کنترل می‌شود: اگر اپ
//          standalone نباشد، App.jsx مستقیماً InstallGate را رندر
//          می‌کند و اصلاً AppRouter را mount نمی‌کند.
//       ۳. رنگ برند + جهت RTL + الگوریتم تیره را به ConfigProvider
//          آنت‌دیزاین می‌دهد.
//       ۴. اگر تب برای مدتی مخفی بود، دوباره سشن را قفل می‌کند.
// -----------------------------------------------------------------------

const AUTO_LOCK_HIDDEN_MS = 2 * 60 * 1000; // re-lock after 2 minutes in background

export default function App() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const darkMode = useDarkMode(); // side-effect hook: syncs <html class="dark">
  const isStandalone = useIsStandalone(); // reactive: true only while running as an installed PWA

  const isUnlocked = useSelector((state) => state.auth.isUnlocked);

  // --- Auto-lock on prolonged background/inactivity ---
  useEffect(() => {
    let hiddenAt = null;

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible" && hiddenAt) {
        const elapsed = Date.now() - hiddenAt;
        if (elapsed > AUTO_LOCK_HIDDEN_MS && isUnlocked) {
          dispatch(lockSession());
        }
        hiddenAt = null;
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [dispatch, isUnlocked]);

  return (
    <ConfigProvider
      direction={i18n.resolvedLanguage === "en" ? "ltr" : "rtl"}
      theme={{
        algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#00A693",
          colorBgBase: darkMode ? "#0b1615" : "#f2fffd",
          borderRadius: 10,
          fontFamily: "Vazirmatn, Inter, system-ui, sans-serif"
        }
      }}
    >
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
        {/* The actual gate: Install Guide for browser tabs, full app for standalone. */}
        {isStandalone ? <AppRouter /> : <InstallGate />}
      </div>
    </ConfigProvider>
  );
}
