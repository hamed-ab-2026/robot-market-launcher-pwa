import React from "react";
import { useTranslation } from "react-i18next";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChartOutlined } from "@ant-design/icons";
import DashboardCard from "./DashboardCard";
import { formatNumberByLocale } from "../../utils/numbers";

// -----------------------------------------------------------------------
// EN: The big sales-trend card from the reference: teal line with a soft
//     gradient fill under it, light gridlines, and a custom tooltip
//     showing the exact value. `recharts` is used (already listed as an
//     available library) instead of hand-rolled SVG so real data updates
//     animate smoothly.
// FA: کارت بزرگ روند فروش از طرح مرجع: خط سبزآبی با گرادیان نرم زیر آن،
//     خطوط شبکه ملایم، و تولتیپ سفارشی برای نمایش مقدار دقیق.
// -----------------------------------------------------------------------

export default function SalesChart({ data }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  return (
    <DashboardCard
      icon={<BarChartOutlined />}
      title={t("dashboard.salesChart.title")}
      subtitle={t("dashboard.salesChart.subtitle")}
      headerExtra={
        <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400">
          {t("dashboard.salesChart.period")}
        </span>
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A693" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#00A693" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700" />
            <XAxis
              dataKey="label"
              tickFormatter={(v) => formatNumberByLocale(v, lang)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              reversed={lang !== "en"}
            />
            <YAxis
              tickFormatter={(v) => `${formatNumberByLocale(v, lang)}M`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={40}
              orientation={lang !== "en" ? "right" : "left"}
            />
            <Tooltip content={<ChartTooltip lang={lang} unitLabel={t("dashboard.salesChart.toman")} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00A693"
              strokeWidth={2.5}
              fill="url(#salesFill)"
              dot={{ r: 3, fill: "#00A693", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

function ChartTooltip({ active, payload, lang, unitLabel }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const formatted = formatNumberByLocale(Math.round(value * 100000), lang);

  return (
    <div className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-bold">
        {formatted} {unitLabel}
      </p>
    </div>
  );
}
