import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import SplashScreen from "../pages/SplashScreen";
import AuthPage from "../pages/AuthPage";
import MainHub from "../pages/MainHub";























const SPLASH_DURATION_MS = 5000;


/**
 * از مسیرهای داخلی محافظت می‌کند و کاربر بدون نشست باز را به صفحه ورود می‌فرستد.
 * آدرس مقصد نگه داشته می‌شود تا پس از ورود امکان بازگشت به همان مسیر وجود داشته باشد.
 */
function RequireUnlock({ children }) {
  const isUnlocked = useSelector((state) => state.auth.isUnlocked);
  const location = useLocation();

  if (!isUnlocked) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
}

/**
 * مسیرهای اصلی برنامه و نمایش اولیه Splash را مدیریت می‌کند.
 * پس از پایان Splash، مسیر احراز هویت و MainHub بر اساس وضعیت قفل در دسترس قرار می‌گیرند.
 */
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
            {}
            <Route path="/auth" element={<AuthPage />} />

            {}
            <Route
        path="/hub"
        element={
        <RequireUnlock>
                        <MainHub />
                    </RequireUnlock>
        } />


            {}
            <Route
        path="/"
        element={
        <RequireUnlock>
                        <Navigate to="/hub" replace />
                    </RequireUnlock>
        } />


            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>);

}
