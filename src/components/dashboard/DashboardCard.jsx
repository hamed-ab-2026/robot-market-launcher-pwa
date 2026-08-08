import React from "react";

// -----------------------------------------------------------------------
// EN: Every card in the reference (sales chart, active devices, recent
//     activity) shares the same chrome: a "..." menu top-start, an
//     icon badge + title/subtitle pair, generous rounded-3xl corners,
//     and consistent internal padding. Centralizing that chrome here
//     means the actual chart/list content is the only thing that
//     differs between cards — exactly the spacing/style consistency
//     the reference calls for.
// FA: هر کارت در طرح مرجع (نمودار فروش، دستگاه‌های فعال، فعالیت‌های
//     اخیر) یک ظاهر مشترک دارد: منوی "..." در ابتدای کارت، جفت
//     آیکون‌نشان + عنوان/زیرعنوان، گوشه‌های بسیار گرد، و padding داخلی
//     یکسان. تمرکز این ظاهر در اینجا یعنی فقط محتوای نمودار/لیست بین
//     کارت‌ها فرق دارد.
// -----------------------------------------------------------------------

export default function DashboardCard({ icon, title, subtitle, headerExtra, showMenu = true, className = "", children }) {
  return (
    <div
      className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {headerExtra}
          {showMenu && (
            <button
              type="button"
              aria-label="menu"
              className="text-slate-300 transition hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
            >
              ⋯
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
