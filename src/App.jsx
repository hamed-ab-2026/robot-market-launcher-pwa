import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {ConfigProvider, theme as antdTheme} from "antd";
import {useTranslation} from "react-i18next";

import AppRouter from "./routes/AppRouter";
import InstallGate from "./pages/InstallGate";
import {useDarkMode} from "./hooks/useDarkMode";
import {useIsStandalone} from "./hooks/useIsStandalone";
import {lockSession} from "./store/slices/authSlice";


const AUTO_LOCK_HIDDEN_MS = 2 * 60 * 1000;

/**
 * ریشه رابط کاربری برنامه است و تم، جهت زبان، قفل نشست و شرط اجرای PWA را کنار هم قرار می‌دهد.
 * اگر برنامه نصب نشده باشد راهنمای نصب نمایش داده می‌شود؛ در غیر این صورت Router اصلی اجرا می‌شود.
 */
export default function App() {
    const dispatch = useDispatch();
    const {i18n} = useTranslation();
    const darkMode = useDarkMode();
    const isStandalone = useIsStandalone();

    const isUnlocked = useSelector((state) => state.auth.isUnlocked);


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
                    borderRadius: 16,
                    controlHeight: 40,
                    fontFamily: "Vazirmatn, system-ui, sans-serif"
                }
            }}>

            <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
                {isStandalone ? <AppRouter/> : <InstallGate/>}
            </div>
        </ConfigProvider>);

}
