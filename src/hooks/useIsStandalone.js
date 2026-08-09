import { useState, useEffect } from "react";
































































/**
 * بررسی می‌کند برنامه واقعاً به شکل PWA نصب‌شده اجرا شده یا فقط در تب مرورگر باز است.
 * علاوه بر display-mode، حالت اختصاصی iOS و اجرای Android TWA نیز پوشش داده می‌شوند.
 */
function detectStandalone() {
  if (typeof window === "undefined") return false;

  const matchesDisplayMode = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const isIosStandalone = window.navigator?.standalone === true;
  const isAndroidTwa = document.referrer?.startsWith("android-app://") ?? false;

  return matchesDisplayMode || isIosStandalone || isAndroidTwa;
}









/**
 * نتیجه تشخیص حالت Standalone را به‌صورت state واکنش‌گرا در اختیار برنامه قرار می‌دهد.
 * با تغییر حالت نمایش، Listener مقدار را دوباره محاسبه می‌کند و هنگام Unmount نیز پاک می‌شود.
 */
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(detectStandalone);


  useEffect(() => {
    const mediaQueryList = window.matchMedia("(display-mode: standalone)");



    const handleChange = () => setIsStandalone(detectStandalone());



    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange);
    } else if (mediaQueryList.addListener) {
      mediaQueryList.addListener(handleChange);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleChange);
      } else if (mediaQueryList.removeListener) {
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, []);

  return isStandalone;
}

export default useIsStandalone;
