import React from "react";
import { useTranslation } from "react-i18next";
import {
  HistoryOutlined,
  FileTextOutlined,
  DeploymentUnitOutlined,
  DollarOutlined,
  SyncOutlined
} from "@ant-design/icons";
import DashboardCard from "./DashboardCard";
import { formatNumberByLocale } from "../../utils/numbers";

// -----------------------------------------------------------------------
// EN: Matches the reference's "Recent activity" list: a small tinted
//     icon per row, a title + relative day, a timestamp, and a "View
//     all" link at the bottom. Each activity `type` maps to both an
//     icon and a translation key so new activity types only need one
//     new entry in ACTIVITY_ICON_MAP + the locale files.
// FA: مطابق لیست "فعالیت‌های اخیر" طرح مرجع: یک آیکون رنگی کوچک برای
//     هر ردیف، عنوان + روز نسبی، زمان، و لینک "مشاهده همه" در پایین.
// -----------------------------------------------------------------------

const ACTIVITY_ICON_MAP = {
  orderPlaced: { icon: FileTextOutlined, tint: "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300" },
  deviceAdded: { icon: DeploymentUnitOutlined, tint: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" },
  paymentSuccess: { icon: DollarOutlined, tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" },
  systemUpdate: { icon: SyncOutlined, tint: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" }
};

export default function RecentActivity({ items }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  return (
    <DashboardCard icon={<HistoryOutlined />} title={t("dashboard.recentActivity.title")} subtitle={t("dashboard.recentActivity.subtitle")}>
      <ul className="space-y-3">
        {items.map((activity) => {
          const config = ACTIVITY_ICON_MAP[activity.type] || ACTIVITY_ICON_MAP.systemUpdate;
          const Icon = config.icon;
          return (
            <li key={activity.id} className="flex items-center gap-3">
              <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${config.tint}`}>
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t(`dashboard.recentActivity.types.${activity.type}`)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{activity.meta}</p>
              </div>
              <div className="flex-none text-end text-xs text-slate-400 dark:text-slate-500">
                <p>{formatNumberByLocale(activity.time, lang)}</p>
                <p>{t(`dashboard.recentActivity.${activity.day}`)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-dashed border-slate-200 py-2 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-slate-600 dark:text-brand-300 dark:hover:bg-brand-900/20"
      >
        {t("dashboard.recentActivity.viewAll")}
      </button>
    </DashboardCard>
  );
}
