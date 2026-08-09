import { useEffect } from "react";
import { useSelector } from "react-redux";












/**
 * وضعیت Dark Mode را از Redux می‌خواند و کلاس dark را روی عنصر html تنظیم می‌کند.
 * خروجی Hook همان وضعیت فعلی است تا کامپوننت والد بتواند تم Ant Design را نیز هماهنگ کند.
 */
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
