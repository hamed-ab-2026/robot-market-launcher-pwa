import {useEffect} from "react";
import {useSelector} from "react-redux";


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
