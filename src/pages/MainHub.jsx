import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Input, Button, message} from "antd";
import {CloudOutlined, ApiOutlined, ArrowRightOutlined, ArrowLeftOutlined} from "@ant-design/icons";

import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ThemeToggle from "../components/common/ThemeToggle";
import {setConnection} from "../store/slices/deviceSlice";

// -----------------------------------------------------------------------
// EN: The "Main Hub" step from the navigation flow. Presents two cards:
//       - Online Panel: connect via a cloud URL
//       - Offline Panel: connect via a local IP address
//     Selecting either expands an inline input + connect button. On
//     submit we save the connection info to Redux (deviceSlice) and
//     navigate to /dashboard, which reads it to fetch data.
// FA: مرحله "هاب اصلی" در جریان ناوبری. دو کارت نمایش می‌دهد:
//       - پنل آنلاین: اتصال با URL ابری
//       - پنل آفلاین: اتصال با آدرس IP محلی
//     انتخاب هرکدام یک ورودی + دکمه اتصال باز می‌کند. با ثبت، اطلاعات
//     اتصال در deviceSlice ذخیره شده و به داشبورد هدایت می‌شویم.
// -----------------------------------------------------------------------

export default function MainHub() {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [expandedCard, setExpandedCard] = useState(null); // "online" | "offline" | null
    const [addressValue, setAddressValue] = useState("");

    const isRtl = document.documentElement.dir === "rtl";
    const ArrowIcon = isRtl ? ArrowLeftOutlined : ArrowRightOutlined;

    function handleConnect(connectionType) {
        const trimmed = addressValue.trim();
        if (!trimmed) {
            message.warning(t("common.error"));
            return;
        }
        dispatch(setConnection({connectionType, address: trimmed}));
        navigate("/dashboard");
    }

    return (
        <div className="flex min-h-screen flex-col bg-surface-light dark:bg-surface-dark">
            <header className="flex items-center justify-end gap-2 p-4">
                <LanguageSwitcher/>
                <ThemeToggle/>
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-10">
                <div className="mb-8 animate-fade-in text-center">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t("hub.welcomeTitle")}</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("hub.welcomeSubtitle")}</p>
                </div>

                <div className="space-y-4">
                    <HubCard
                        icon={<CloudOutlined/>}
                        title={t("hub.onlinePanel.title")}
                        description={t("hub.onlinePanel.description")}
                        isExpanded={expandedCard === "online"}
                        onToggle={() => {
                            setExpandedCard(expandedCard === "online" ? null : "online");
                            setAddressValue("");
                        }}
                    >
                        <Input
                            size="large"
                            placeholder={t("hub.urlPlaceholder")}
                            value={addressValue}
                            onChange={(e) => setAddressValue(e.target.value)}
                            onPressEnter={() => handleConnect("online")}
                        />
                        <Button
                            type="primary"
                            size="large"
                            block
                            className="mt-3 bg-brand-500 hover:!bg-brand-600"
                            icon={<ArrowIcon/>}
                            iconPosition="end"
                            onClick={() => handleConnect("online")}
                        >
                            {t("hub.connectButton")}
                        </Button>
                    </HubCard>

                    <HubCard
                        icon={<ApiOutlined/>}
                        title={t("hub.offlinePanel.title")}
                        description={t("hub.offlinePanel.description")}
                        isExpanded={expandedCard === "offline"}
                        onToggle={() => {
                            setExpandedCard(expandedCard === "offline" ? null : "offline");
                            setAddressValue("");
                        }}
                    >
                        <Input
                            size="large"
                            placeholder={t("hub.ipPlaceholder")}
                            value={addressValue}
                            onChange={(e) => setAddressValue(e.target.value)}
                            onPressEnter={() => handleConnect("offline")}
                        />
                        <Button
                            type="primary"
                            size="large"
                            block
                            className="mt-3 bg-brand-500 hover:!bg-brand-600"
                            icon={<ArrowIcon/>}
                            iconPosition="end"
                            onClick={() => handleConnect("offline")}
                        >
                            {t("hub.connectButton")}
                        </Button>
                    </HubCard>


                    <Button
                        type="primary"
                        onClick={() => window.location.href = 'http://192.168.4.1'}
                    >
                        192.168.4.1
                    </Button>

                </div>
            </main>
        </div>
    );
}

/** EN: A single expandable hub option card. FA: یک کارت گزینه قابل‌بازشدن در هاب. */
function HubCard({icon, title, description, isExpanded, onToggle, children}) {
    return (
        <div
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50 transition dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center gap-4 p-5 text-start"
            >
                <div
                    className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                </div>
            </button>

            {isExpanded && (
                <div className="animate-fade-in border-t border-slate-100 p-5 dark:border-slate-700">
                    {children}
                </div>
            )}
        </div>
    );
}
