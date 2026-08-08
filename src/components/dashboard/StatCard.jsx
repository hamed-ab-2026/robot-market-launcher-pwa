import React from "react";

// -----------------------------------------------------------------------
// EN: One reusable card for the 4 top-row KPIs (online devices, active
//     robots, avg battery, alerts). Kept intentionally generic — pass an
//     icon, label, value, and optional accent color — so adding a 5th
//     stat later is a one-line change in Dashboard.jsx, not a new file.
// FA: یک کارت قابل استفاده مجدد برای ۴ آمار ردیف بالا. عمداً کلی نگه
//     داشته شده — آیکون، برچسب، مقدار و رنگ اختیاری بگیرید — تا افزودن
//     آمار پنجم فقط یک خط تغییر در Dashboard.jsx باشد.
// -----------------------------------------------------------------------

export default function StatCard({ icon, label, value, accent = "brand" }) {
  const accentClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
  };

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-xl ${accentClasses[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
