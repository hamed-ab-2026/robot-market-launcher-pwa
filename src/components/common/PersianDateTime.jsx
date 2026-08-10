import React, { useEffect, useMemo, useState } from "react";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function PersianDateTime() {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const formatted = useMemo(() => {
    const locale = i18n.resolvedLanguage === "en" ? "en-US-u-ca-persian" : "fa-IR-u-ca-persian";
    return {
      date: new Intl.DateTimeFormat(locale, {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      }).format(now),
      time: new Intl.DateTimeFormat(locale, {
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      }).format(now)
    };
  }, [i18n.resolvedLanguage, now]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <span className="flex items-center gap-1.5"><CalendarOutlined />{formatted.date}</span>
      <span className="flex items-center gap-1.5" dir="ltr"><ClockCircleOutlined />{formatted.time}</span>
    </div>
  );
}
