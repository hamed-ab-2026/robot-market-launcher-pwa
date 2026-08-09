import React from "react";










/**
 * تعداد رقم‌های واردشده PIN را به شکل نقطه‌های پر و خالی نمایش می‌دهد.
 * مقدار واقعی رمز در این کامپوننت وارد نمی‌شود و isError فقط انیمیشن و رنگ خطا را فعال می‌کند.
 */
export default function PasscodeDots({ filledCount, length = 6, isError = false }) {
  return (
    <div
      className={`flex gap-2.5 ${isError ? "animate-shake" : ""}`}
      role="status"
      aria-label={`${filledCount}/${length}`}>

            {Array.from({ length }).map((_, index) => {
        const isFilled = index < filledCount;
        return (
          <span
            key={index}
            className={[
            "h-2.5 w-2.5 rounded-full transition-all duration-150",
            isError ? "bg-red-400" : isFilled ? "bg-brand-500 scale-110" : "bg-slate-200 dark:bg-slate-600"].
            join(" ")} />);


      })}
        </div>);

}
