import React from "react";
import {useTranslation} from "react-i18next";


export default function SplashScreen() {
    const {t} = useTranslation();

    return (
        <div className="splash-screen" role="status" aria-live="polite">
            <div className="splash-glow splash-glow-start"/>
            <div className="splash-glow splash-glow-end"/>

            <div className="splash-avatar-stage" aria-hidden="true">
                <span className="splash-orbit splash-orbit-one"/>
                <span className="splash-orbit splash-orbit-two"/>
                <div className="splash-avatar-shadow"/>

                <div className="splash-avatar">
                    <span className="splash-antenna">
                        <span/>
                    </span>
                    <div className="splash-avatar-face">
                        <div className="splash-avatar-eyes">
                            <span className="splash-avatar-eye"/>
                            <span className="splash-avatar-eye"/>
                        </div>
                        <span className="splash-avatar-smile"/>
                    </div>
                    <span className="splash-avatar-signal splash-avatar-signal-one"/>
                    <span className="splash-avatar-signal splash-avatar-signal-two"/>
                </div>
            </div>

            <div className="relative z-10 text-center">
                <h1 className="text-2xl font-bold tracking-wide text-white">{t("app.name")}</h1>
                <p className="mt-1 text-sm text-white/80">{t("splash.tagline")}</p>
            </div>

            <div className="relative z-10 flex gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((i) =>
                    <span
                        key={i}
                        className="splash-loading-dot"
                        style={{animationDelay: `${i * 0.16}s`}}/>
                )}
            </div>
        </div>);

}
