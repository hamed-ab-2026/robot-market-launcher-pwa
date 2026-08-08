import {useState, useEffect} from "react";

// -----------------------------------------------------------------------
// EN: A single-purpose hook: is this page currently running in
//     standalone display mode (i.e. installed and launched as a PWA,
//     not opened in a normal browser tab)?
//
//     WHY matchMedia AND NOT beforeinstallprompt:
//     -------------------------------------------
//     `beforeinstallprompt` answers a completely different question —
//     "CAN this page be installed right now" — and only fires once,
//     before installation, on Chromium-based browsers. It cannot tell
//     you whether the app IS currently installed/running standalone,
//     it doesn't fire again after install, and it's entirely absent on
//     Safari/iOS and Firefox (so relying on it leaves those browsers
//     with no signal at all — exactly the kind of "broken on some
//     devices" bug that prompted this fix).
//
//     `window.matchMedia('(display-mode: standalone)')`, by contrast:
//       - is a standard CSS media feature (part of the Web App Manifest
//         spec), supported for READING current state on every major
//         engine — Chromium, WebKit/Safari, and Firefox;
//       - reflects the ACTUAL current rendering mode of this exact
//         page load, not a future possibility;
//       - is reactive: the returned MediaQueryList fires a native
//         "change" event if display mode ever flips while the page is
//         open (e.g. the OS moves the window, or an already-open tab
//         gets "installed" via the browser's install icon), so the UI
//         updates itself with zero polling.
//
//     This hook wraps exactly that API, plus the two documented
//     non-Chromium fallbacks (`navigator.standalone` for iOS Safari,
//     and the `android-app://` referrer for Android TWA shells), since
//     none of those browsers set `display-mode` identically.
//
// FA: یک هوک تک‌منظوره: آیا این صفحه در حال حاضر در حالت نمایش
//     standalone اجرا می‌شود (یعنی به‌صورت PWA نصب و اجرا شده، نه در یک
//     تب معمولی مرورگر)؟
//
//     چرا matchMedia و نه beforeinstallprompt:
//     -----------------------------------------
//     beforeinstallprompt به سؤال کاملاً متفاوتی پاسخ می‌دهد — "آیا این
//     صفحه الان قابل نصب است؟" — و فقط یک‌بار، قبل از نصب، در مرورگرهای
//     مبتنی بر Chromium فایر می‌شود. نمی‌تواند بگوید اپ الان نصب شده و
//     در حال اجراست یا نه، بعد از نصب دوباره فایر نمی‌شود، و کلاً در
//     سافاری/iOS و فایرفاکس وجود ندارد.
//
//     در مقابل matchMedia('(display-mode: standalone)'):
//       - یک ویژگی رسانه‌ای استاندارد (بخشی از مشخصات Web App Manifest)
//         است که در همه موتورهای اصلی برای خواندن وضعیت فعلی پشتیبانی
//         می‌شود؛
//       - وضعیت واقعی رندر فعلی همین بارگذاری صفحه را نشان می‌دهد؛
//       - واکنش‌گراست: MediaQueryList برگشتی، رویداد بومی "change" را
//         در صورت تغییر حالت نمایش، حین باز بودن صفحه، فایر می‌کند.
// -----------------------------------------------------------------------

/**
 * EN: Runs the actual cross-browser detection. Kept as a plain function
 *     (not part of the hook body) so it can also be called synchronously
 *     for the hook's initial state, with no "flash of wrong UI" on mount.
 * FA: تشخیص واقعی بین‌مرورگری را انجام می‌دهد. به‌صورت یک تابع ساده (نه
 *     بخشی از بدنه هوک) نگه داشته شده تا برای وضعیت اولیه هوک هم بتوان
 *     همزمان (synchronous) صدایش زد و از "فلاش UI اشتباه" هنگام mount
 *     جلوگیری کرد.
 */
function detectStandalone() {
    if (typeof window === "undefined") return false;

    const matchesDisplayMode = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    const isIosStandalone = window.navigator?.standalone === true; // legacy Safari/iOS flag
    const isAndroidTwa = document.referrer?.startsWith("android-app://") ?? false;

    return matchesDisplayMode || isIosStandalone || isAndroidTwa;
}

/**
 * EN: React hook — returns `true` while the app is running standalone,
 *     and stays live-updated for the lifetime of the component tree.
 * FA: هوک React — در حین اجرای standalone اپ مقدار true برمی‌گرداند و
 *     در طول عمر درخت کامپوننت به‌روز می‌ماند.
 *
 * @returns {boolean} isStandalone
 */
export function useIsStandalone() {
    const [isStandalone, setIsStandalone] = useState(detectStandalone);
    // const [isStandalone, setIsStandalone] = useState(true); // for test

    useEffect(() => {
        const mediaQueryList = window.matchMedia("(display-mode: standalone)");

        // Re-run the FULL detection (not just the media query) on every change,
        // so the iOS/Android fallbacks stay correct too if anything shifts.
        const handleChange = () => setIsStandalone(detectStandalone());

        // Safari < 14 / older engines expose addListener instead of the
        // standard EventTarget addEventListener on MediaQueryList.
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
