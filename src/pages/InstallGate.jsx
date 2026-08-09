import React, {useState} from "react";
import {Button, message} from "antd";
import {useTranslation} from "react-i18next";
import {DownloadOutlined, ReloadOutlined} from "@ant-design/icons";
import {useInstallPrompt} from "../hooks/useInstallPrompt";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ThemeToggle from "../components/common/ThemeToggle";


export default function InstallGate() {
    const {t} = useTranslation();
    const {canInstall, promptInstall} = useInstallPrompt();
    const [isInstalling, setIsInstalling] = useState(false);

    async function handleInstallClick() {
        setIsInstalling(true);
        try {
            const outcome = await promptInstall();
            if (outcome === "dismissed") {
                message.info(t("install.orManually"));
            } else if (outcome === null) {
                message.warning(t("install.installFailed"));
            }

        } finally {
            setIsInstalling(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-surface-light dark:bg-surface-dark">
            <header className="flex items-center justify-end gap-2 p-4">
                <LanguageSwitcher/>
                <ThemeToggle/>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
                    <DownloadOutlined className="text-3xl text-white"/>
                </div>

                <h1 className="max-w-sm text-xl font-bold text-slate-800 dark:text-white">
                    {t("install.title")}
                </h1>
                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    {t("install.description")}
                </p>

                {canInstall &&
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined/>}
                        loading={isInstalling}
                        onClick={handleInstallClick}
                        className="mt-6 h-12 w-full max-w-sm rounded-2xl bg-brand-500 text-base font-semibold hover:!bg-brand-600">

                        {isInstalling ? t("install.installing") : t("install.installButton")}
                    </Button>
                }

                <div
                    className="mt-8 w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-5 text-start shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
                    <h2 className="mb-3 text-sm font-semibold text-brand-600 dark:text-brand-300">
                        {canInstall ? t("install.orManually") : t("install.howTo")}
                    </h2>
                    <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex gap-2">
                            <span
                                className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">1</span>
                            {t("install.step1")}
                        </li>
                        <li className="flex gap-2">
                            <span
                                className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">2</span>
                            {t("install.step2")}
                        </li>
                        <li className="flex gap-2">
                            <span
                                className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">3</span>
                            {t("install.step3")}
                        </li>
                    </ol>
                </div>

                <Button type="default" icon={<ReloadOutlined/>} className="mt-6"
                        onClick={() => window.location.reload()}>
                    {t("install.retryButton")}
                </Button>
            </main>
        </div>);

}
