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
