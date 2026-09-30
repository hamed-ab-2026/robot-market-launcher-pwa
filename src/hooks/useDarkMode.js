import {useEffect} from "react";
import {useSelector} from "react-redux";
import {selectDarkMode} from "../store/slices/uiSlice";


export function useDarkMode() {
    const darkMode = useSelector(selectDarkMode);

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
