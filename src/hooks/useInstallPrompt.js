import {useState, useEffect, useCallback} from "react";


export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        /** حالت اجرای مستقل، نصب‌شدن برنامه روی دستگاه فعلی را با امکانات استاندارد مرورگر تشخیص می‌دهد. */
        const standalone = window.matchMedia?.("(display-mode: standalone)").matches ||
            window.navigator?.standalone === true ||
            document.referrer?.startsWith("android-app://");
        setIsInstalled(Boolean(standalone));

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
