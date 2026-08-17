import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {Dropdown} from "antd";
import {GlobalOutlined} from "@ant-design/icons";
import {setLanguage} from "../../store/slices/uiSlice";
import {SUPPORTED_LANGUAGES} from "../../i18n";


const LANGUAGE_LABELS = {fa: "فارسی", en: "English"};


export default function LanguageSwitcher() {
    const dispatch = useDispatch();
    const currentLanguage = useSelector((state) => state.ui.language);

    const items = SUPPORTED_LANGUAGES.map((lng) => ({
        key: lng,
        label: LANGUAGE_LABELS[lng],
        onClick: () => dispatch(setLanguage(lng))
    }));

    return (
        <Dropdown menu={{items, selectedKeys: [currentLanguage]}} trigger={["click"]}>
            <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500">
                <GlobalOutlined/>
                {LANGUAGE_LABELS[currentLanguage]}
            </button>
        </Dropdown>);

}
