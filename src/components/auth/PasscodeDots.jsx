import React from "react";

// -----------------------------------------------------------------------
// EN: In the reference design the dot progress indicator sits ABOVE the
//     fingerprint button, separate from the keypad grid below it. Split
//     out as its own tiny component so AuthPage can place it exactly
//     where the mock shows it.
// FA: در طرح مرجع، نشانگر نقطه‌ای پیشرفت بالای دکمه اثرانگشت قرار دارد،
//     جدا از شبکه کیبورد پایین آن. به‌صورت یک کامپوننت کوچک جدا شده تا
//     AuthPage بتواند دقیقاً همان‌جایی که طرح نشان می‌دهد قرارش دهد.
// -----------------------------------------------------------------------
export default function PasscodeDots({ filledCount, length = 6, isError = false }) {
  return (
    <div
      className={`flex gap-2.5 ${isError ? "animate-shake" : ""}`}
      role="status"
      aria-label={`${filledCount}/${length}`}
    >
      {Array.from({ length }).map((_, index) => {
        const isFilled = index < filledCount;
        return (
          <span
            key={index}
            className={[
              "h-2.5 w-2.5 rounded-full transition-all duration-150",
              isError ? "bg-red-400" : isFilled ? "bg-brand-500 scale-110" : "bg-slate-200 dark:bg-slate-600"
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
