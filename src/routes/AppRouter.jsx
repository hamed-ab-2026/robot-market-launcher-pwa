import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import SplashScreen from "../pages/SplashScreen";
import AuthPage from "../pages/AuthPage";
import MainHub from "../pages/MainHub";
import Dashboard from "../pages/Dashboard";

// -----------------------------------------------------------------------
// EN: This file encodes the rest of the spec's navigation flow, AFTER
//     the PWA gate:
//
//     Splash (5s) -> Auth (setup/unlock) -> Main Hub -> Dashboard
//
//     The "is this a browser tab or an installed PWA" decision no
//     longer lives here — App.jsx checks that with useIsStandalone()
//     and only mounts THIS component at all once the app is confirmed
//     to be running standalone. That means every route below can safely
//     assume it's already inside an installed PWA.
//
// FA: این فایل باقی جریان ناوبری طبق مشخصات را، بعد از گیت PWA، پیاده
//     می‌کند:
//
//     اسپلش (۵ ثانیه) -> احراز هویت -> هاب اصلی -> داشبورد
//
//     تصمیم "این یک تب مرورگر است یا PWA نصب‌شده" دیگر اینجا نیست —
//     App.jsx این را با useIsStandalone() بررسی می‌کند و این کامپوننت
//     فقط زمانی mount می‌شود که مطمئن باشیم اپ standalone است.
// -----------------------------------------------------------------------

const SPLASH_DURATION_MS = 5000;

/** EN: Redirects to the passcode screen if the session isn't unlocked yet. FA: اگر سشن باز نشده، به صفحه رمز عبور هدایت می‌کند. */
function RequireUnlock({ children }) {
  const isUnlocked = useSelector((state) => state.auth.isUnlocked);
  const location = useLocation();

  if (!isUnlocked) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
}

export default function AppRouter() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!splashDone) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Passcode setup / unlock screen */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Main Hub: choose Online (URL) vs Offline (IP) panel */}
      <Route
        path="/hub"
        element={
          <RequireUnlock>
            <MainHub />
          </RequireUnlock>
        }
      />

      {/* Main management dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireUnlock>
            <Dashboard />
          </RequireUnlock>
        }
      />

      {/* Default: send everyone through the unlock check from "/" */}
      <Route
        path="/"
        element={
          <RequireUnlock>
            <Navigate to="/hub" replace />
          </RequireUnlock>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
