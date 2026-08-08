import { useEffect } from "react";
import { useSelector } from "react-redux";

// -----------------------------------------------------------------------
// EN: Tailwind's `darkMode: "class"` strategy looks for a `dark` class on
//     <html>. This hook is the ONLY place that toggles that class, driven
//     entirely by Redux's `ui.darkMode` value — so every card, sidebar,
//     and page that uses `dark:` utility classes stays in sync
//     automatically, with a single source of truth.
// FA: استراتژی "class" تیلویند دنبال کلاس dark روی <html> می‌گردد. این
//     هوک تنها جایی است که این کلاس را (بر اساس مقدار ui.darkMode در
//     ردداکس) تغییر می‌دهد — بنابراین همه کارت‌ها و صفحات با کلاس‌های
//     dark: به‌صورت خودکار و از یک منبع واحد هماهنگ می‌مانند.
// -----------------------------------------------------------------------
export function useDarkMode() {
  const darkMode = useSelector((state) => state.ui.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return darkMode;
}

export default useDarkMode;
