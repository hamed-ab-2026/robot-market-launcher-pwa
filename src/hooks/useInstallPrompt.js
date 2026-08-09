import {useState, useEffect, useCallback} from "react";


/**
 * رویداد نصب PWA در مرورگرهای Chromium را نگه می‌دارد تا نصب با دکمه اختصاصی برنامه آغاز شود.
 * Hook همچنین نصب موفق را تشخیص می‌دهد و تابع promptInstall را برای نمایش پنجره بومی مرورگر ارائه می‌کند.
 */
export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        /** رویداد موقت نصب را قبل از ازبین‌رفتن ذخیره و نمایش خودکار مرورگر را متوقف می‌کند. */
        function handleBeforeInstallPrompt(event) {
            event.preventDefault();
            setDeferredPrompt(event);
        }

        /** پس از نصب موفق، رویداد مصرف‌شده را پاک و وضعیت نصب را به‌روز می‌کند. */
        function handleAppInstalled() {
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


    /** پنجره نصب ذخیره‌شده را نمایش می‌دهد و انتخاب قبول یا رد کاربر را برمی‌گرداند. */
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return null;

        deferredPrompt.prompt();
        const {outcome} = await deferredPrompt.userChoice;


        setDeferredPrompt(null);

        return outcome;
    }, [deferredPrompt]);

    return {
        canInstall: Boolean(deferredPrompt),
        isInstalled,
        promptInstall
    };
}

export default useInstallPrompt;
