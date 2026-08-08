import React from "react";
import { useTranslation } from "react-i18next";
import RobotMascot from "../components/common/RobotMascot";

// -----------------------------------------------------------------------
// EN: Shown for exactly 5 seconds on every cold start (see
//     SPLASH_DURATION_MS in routes/AppRouter.jsx, which controls the
//     timing — this component only handles the visuals).
// FA: در هر شروع سرد اپلیکیشن، دقیقاً ۵ ثانیه نمایش داده می‌شود (زمان‌بندی
//     در routes/AppRouter.jsx کنترل می‌شود — این کامپوننت فقط ظاهر است).
// -----------------------------------------------------------------------
export default function SplashScreen() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-brand-500 to-brand-700">
      {/* Logo mark, pulsing per spec */}
      <div className="animate-pulse-logo">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/95 p-3 shadow-2xl shadow-black/20">
          <RobotMascot variant="mark" className="h-full w-full" />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-wide text-white">{t("app.name")}</h1>
        <p className="mt-1 text-sm text-white/80">{t("splash.tagline")}</p>
      </div>

      {/* Subtle loading indicator so the 5s wait doesn't feel frozen */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse-logo"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
