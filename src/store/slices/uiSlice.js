import {createSlice} from "@reduxjs/toolkit";
import i18n, {LANGUAGE_STORAGE_KEY} from "../../i18n";


const DARK_MODE_STORAGE_KEY = "app_dark_mode";


/** Reads the saved color-scheme preference without breaking restricted storage modes. */
function readPersistedDarkMode() {
    try {
        return localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

const initialState = {
    darkMode: readPersistedDarkMode(),
    language: i18n.resolvedLanguage || "fa"
};


const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
            persistDarkMode(state.darkMode);
        },
        setDarkMode(state, action) {
            state.darkMode = action.payload;
            persistDarkMode(state.darkMode);
        },
        setLanguage(state, action) {
            const lng = action.payload;
            state.language = lng;


            i18n.changeLanguage(lng);
            try {
                localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
            } catch {

            }
        }
    }
});

/** Persists dark-mode changes outside Redux because the preference must survive reloads. */
function persistDarkMode(value) {
    try {
        localStorage.setItem(DARK_MODE_STORAGE_KEY, String(value));
    } catch {
    }
}

export const {toggleDarkMode, setDarkMode, setLanguage} = uiSlice.actions;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectCurrentLanguage = (state) => state.ui.language;

export default uiSlice.reducer;
