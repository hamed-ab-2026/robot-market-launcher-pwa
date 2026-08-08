import React from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DeploymentUnitOutlined } from "@ant-design/icons";
import DashboardCard from "./DashboardCard";
import { formatNumberByLocale } from "../../utils/numbers";

// -----------------------------------------------------------------------
// EN: Matches the reference's donut chart exactly: a ring split into
//     online (teal) / offline (gray) / pending (amber) segments, the
//     total device count centered inside the ring, and a legend with
//     colored dots to the side.
// FA: دقیقاً مطابق نمودار دونات طرح مرجع: حلقه‌ای که به بخش‌های آنلاین
//     (سبزآبی)، آفلاین (خاکستری) و در انتظار (کهربایی) تقسیم شده، تعداد
//     کل دستگاه‌ها در مرکز حلقه، و یک راهنما با نقطه‌های رنگی کنار آن.
// -----------------------------------------------------------------------

export default function DeviceStatusDonut({ breakdown }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  const segments = [
    { key: "online", value: breakdown.online, color: "#00A693" },
    { key: "offline", value: breakdown.offline, color: "#CBD5E1" },
    { key: "pending", value: breakdown.pending, color: "#FFC53D" }
  ];

  return (
    <DashboardCard
      icon={<DeploymentUnitOutlined />}
      title={t("dashboard.activeDevices.title")}
      subtitle={t("dashboard.activeDevices.subtitle")}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-32 w-32 flex-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="key"
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {segments.map((segment) => (
                  <Cell key={segment.key} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered total, overlaid on the donut hole */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              {formatNumberByLocale(breakdown.total, lang)}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {t("dashboard.activeDevices.unit")}
            </span>
          </div>
        </div>

        <ul className="flex-1 space-y-2.5">
          {segments.map((segment) => (
            <li key={segment.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                {t(`dashboard.activeDevices.${segment.key}`)}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatNumberByLocale(segment.value, lang)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}
