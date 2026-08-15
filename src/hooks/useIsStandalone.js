import {useState, useEffect} from "react";


function detectStandalone() {
    if (typeof window === "undefined") return false;

    const matchesDisplayMode = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    const isIosStandalone = window.navigator?.standalone === true;
    const isAndroidTwa = document.referrer?.startsWith("android-app://") ?? false;

    return matchesDisplayMode || isIosStandalone || isAndroidTwa;
}


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
