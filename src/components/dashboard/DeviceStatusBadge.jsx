import React from "react";
import { useTranslation } from "react-i18next";

// -----------------------------------------------------------------------
// EN: Small colored pill used inside the device table's "status" column.
//     Colors are semantic (green=online, amber=charging, red=error,
//     gray=offline) and dark-mode variants are defined alongside each
//     light one so the two never drift out of sync.
// FA: یک نشان رنگی کوچک در ستون وضعیت جدول دستگاه‌ها. رنگ‌ها معنایی
//     هستند (سبز=آنلاین، کهربایی=شارژ، قرمز=خطا، خاکستری=آفلاین).
// -----------------------------------------------------------------------

const STATUS_STYLES = {
  online: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  charging: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  error: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  offline: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
};

export default function DeviceStatusBadge({ status }) {
  const { t } = useTranslation();
  const styles = STATUS_STYLES[status] || STATUS_STYLES.offline;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(`dashboard.status.${status}`)}
    </span>
  );
}
