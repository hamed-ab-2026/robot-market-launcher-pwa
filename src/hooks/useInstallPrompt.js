import { useState, useEffect, useCallback } from "react";

// -----------------------------------------------------------------------
// EN: Wraps the browser's native "Add to Home Screen" flow.
//
//     Chromium-based browsers (Chrome, Edge, Samsung Internet, ...) fire
//     a `beforeinstallprompt` event on the `window` when the current
//     page is eligible to be installed. That event is NOT a signal you
//     can check on demand — it only exists for the brief window between
//     the browser deciding "this is installable" and the user acting on
//     it, so it MUST be captured and stored the moment it fires (usually
//     right after the page loads), then replayed later when the user
//     taps our own "Install App" button.
//
//     By default the browser would show its own mini-infobar/prompt
//     automatically; calling `event.preventDefault()` suppresses that so
//     we control exactly when the native dialog appears (i.e. only when
//     the user taps OUR button, not whenever Chrome feels like it).
//
//     IMPORTANT — this event is Chromium-only. Safari/iOS and Firefox
//     never fire it, so `canInstall` will simply stay `false` there.
//     That's expected, not a bug: InstallGate.jsx falls back to the
//     manual "Add to Home Screen" instructions for those browsers.
//
// FA: جریان بومی "افزودن به صفحه اصلی" مرورگر را wrap می‌کند.
//
//     مرورگرهای مبتنی بر Chromium رویداد beforeinstallprompt را روی
//     window فایر می‌کنند وقتی صفحه فعلی قابل نصب باشد. این رویداد را
//     نمی‌توان بعداً به‌صورت دستی چک کرد — فقط در یک بازه کوتاه (معمولاً
//     بلافاصله بعد از بارگذاری صفحه) فایر می‌شود، پس باید همان لحظه
//     ذخیره شود تا بعداً، با تپ کاربر روی دکمه "نصب برنامه"، دوباره
//     پخش (prompt) شود.
//
//     مهم — این رویداد فقط در Chromium وجود دارد. سافاری/iOS و فایرفاکس
//     هرگز آن را فایر نمی‌کنند، پس canInstall آنجا false باقی می‌ماند.
//     این طبیعی است، نه باگ — InstallGate.jsx برای آن مرورگرها به
//     راهنمای دستی "افزودن به صفحه اصلی" برمی‌گردد.
// -----------------------------------------------------------------------

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      // Stop the browser's own automatic mini-infobar — we'll trigger
      // the same native dialog ourselves, later, via promptInstall().
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleAppInstalled() {
      // Fired once the user actually finishes installing. Clearing the
      // saved event here means our "Install App" button disappears
      // immediately instead of staying visible after a completed install.
      setDeferredPrompt(null);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  /**
   * EN: Replays the captured event, which shows the browser's native
   *     install dialog. Returns the user's choice ("accepted" | "dismissed"),
   *     or null if no prompt was ever captured (e.g. unsupported browser,
   *     or the page didn't yet meet installability criteria).
   * FA: رویداد ذخیره‌شده را دوباره پخش می‌کند که دیالوگ نصب بومی مرورگر
   *     را نشان می‌دهد. انتخاب کاربر را برمی‌گرداند، یا null اگر هیچ
   *     prompt ای گرفته نشده باشد.
   */
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    // A captured `beforeinstallprompt` event can only be used ONCE —
    // discard it either way so we don't try to re-prompt a stale event.
    setDeferredPrompt(null);

    return outcome; // "accepted" | "dismissed"
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt), // true only while a real, usable native prompt is available
    isInstalled,
    promptInstall
  };
}

export default useInstallPrompt;
