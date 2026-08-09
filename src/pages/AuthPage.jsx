import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "antd";

import NumericKeypad from "../components/auth/NumericKeypad";
import PasscodeDots from "../components/auth/PasscodeDots";
import RobotMascot from "../components/common/RobotMascot";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ThemeToggle from "../components/common/ThemeToggle";
import { setupPasscode, unlockWithPasscode, unlockWithBiometrics } from "../store/slices/authSlice";
import { useWebAuthn, useWebAuthnAvailability } from "../hooks/useWebAuthn";

const PASSCODE_LENGTH = 6;






















/**
 * صفحه ساخت یا ورود PIN است و بر اساس وجود هش ذخیره‌شده بین دو حالت Setup و Unlock جابه‌جا می‌شود.
 * محدودیت تلاش، قفل زمانی و ورود بایومتریک نیز در همین صفحه هماهنگ می‌شوند.
 */
export default function AuthPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const hasPasscode = useSelector((state) => state.auth.hasPasscode);
  const attemptsRemaining = useSelector((state) => state.auth.attemptsRemaining);
  const lockedUntil = useSelector((state) => state.auth.lockedUntil);
  const isUnlocked = useSelector((state) => state.auth.isUnlocked);

  const { authenticateBiometric, registerBiometric, hasBiometricRegistered } = useWebAuthn();
  const isBiometricAvailable = useWebAuthnAvailability();


  const [setupStep, setSetupStep] = useState("create");
  const [firstEntry, setFirstEntry] = useState("");

  const [value, setValue] = useState("");
  const [isError, setIsError] = useState(false);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);


  useEffect(() => {
    if (isUnlocked) {
      const redirectTo = location.state?.from?.pathname || "/hub";
      navigate(redirectTo, { replace: true });
    }
  }, [isUnlocked, navigate, location.state]);


  useEffect(() => {
    if (!lockedUntil) {
      setRemainingLockSeconds(0);
      return;
    }
    const tick = () => setRemainingLockSeconds(Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLockedOut = remainingLockSeconds > 0;

  /** پیام خطا و انیمیشن را فعال می‌کند و پس از یک مکث کوتاه ورودی PIN را برای تلاش بعدی پاک می‌کند. */
  const triggerError = useCallback((errorMessage) => {
    setIsError(true);
    message.error(errorMessage);
    setTimeout(() => {
      setIsError(false);
      setValue("");
    }, 400);
  }, []);


  /**
   * PIN کامل‌شده را بر اساس حالت صفحه پردازش می‌کند.
   * در Setup دو ورود را تطبیق می‌دهد و در Unlock صحت PIN را از Redux درخواست می‌کند.
   */
  const handleComplete = useCallback(
    async (enteredValue) => {
      if (!hasPasscode) {

        if (setupStep === "create") {
          setFirstEntry(enteredValue);
          setSetupStep("confirm");
          setValue("");
          return;
        }
        if (enteredValue !== firstEntry) {
          triggerError(t("auth.mismatchError"));
          setSetupStep("create");
          setFirstEntry("");
          return;
        }
        await dispatch(setupPasscode(enteredValue));

        if (isBiometricAvailable) {
          try {
            await registerBiometric();
          } catch {

          }
        }
        return;
      }


      try {
        await dispatch(unlockWithPasscode(enteredValue)).unwrap();
      } catch (errorCode) {
        const msg = errorCode === "WRONG_PASSCODE" ? t("auth.wrongPasscode") : t("common.error");
        triggerError(msg);
      }
    },
    [hasPasscode, setupStep, firstEntry, dispatch, isBiometricAvailable, registerBiometric, t, triggerError]
  );

  /** مقدار صفحه‌کلید را به‌روز می‌کند و با رسیدن به شش رقم، پردازش PIN را خودکار آغاز می‌کند. */
  const handleChange = useCallback(
    (nextValue) => {
      setValue(nextValue);
      if (nextValue.length === PASSCODE_LENGTH) {
        handleComplete(nextValue);
      }
    },
    [handleComplete]
  );

  /** درخواست اثرانگشت یا تشخیص چهره را اجرا و پس از موفقیت نشست Redux را باز می‌کند. */
  const handleBiometricTap = useCallback(async () => {
    try {
      const verified = await authenticateBiometric();
      if (verified) {
        await dispatch(unlockWithBiometrics());
      }
    } catch {
      message.error(t("auth.wrongPasscode"));
    }
  }, [authenticateBiometric, dispatch, t]);

  const title = !hasPasscode ?
  setupStep === "create" ?
  t("auth.setupTitle") :
  t("auth.confirmTitle") :
  t("auth.unlockTitle");
  const subtitle = !hasPasscode ? t("auth.setupSubtitle") : t("auth.unlockSubtitle");
  const showBiometricButton = hasPasscode && isBiometricAvailable && hasBiometricRegistered();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-surface-light to-brand-50 dark:from-surface-dark dark:to-slate-900">
      {}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 opacity-60 dark:opacity-20"
        viewBox="0 0 400 200"
        preserveAspectRatio="none">

        <path d="M0,100 C100,180 300,20 400,100 L400,200 L0,200 Z" fill="#B9EDE4" />
      </svg>

      <header className="relative z-10 flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <RobotMascot variant="illustration" className="mb-4 h-32 w-32 animate-fade-in" />

        <div className="mb-6 text-center animate-fade-in">
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="mb-6">
          <PasscodeDots filledCount={value.length} length={PASSCODE_LENGTH} isError={isError} />
        </div>

        {hasPasscode && !isLockedOut && attemptsRemaining < 5 &&
        <p className="mb-4 text-xs font-medium text-amber-500">
            {t("auth.attemptsRemaining", { count: attemptsRemaining })}
          </p>
        }
        {isLockedOut &&
        <p className="mb-4 text-xs font-medium text-red-500">
            {t("auth.lockedOut", { seconds: remainingLockSeconds })}
          </p>
        }

        {showBiometricButton &&
        <button
          type="button"
          onClick={handleBiometricTap}
          disabled={isLockedOut}
          className="mb-8 flex flex-col items-center gap-2 disabled:opacity-40">

            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl text-brand-500 ring-2 ring-brand-100 dark:bg-brand-900/30 dark:ring-brand-800">
              <FingerprintIcon />
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("auth.biometricButton")}
            </span>
          </button>
        }

        <NumericKeypad
          value={value}
          onChange={handleChange}
          onSubmit={handleComplete}
          length={PASSCODE_LENGTH}
          isError={isError}
          disabled={isLockedOut} />

      </main>
    </div>);

}


/** آیکون سبک و مستقل اثرانگشت را به‌صورت SVG داخلی رندر می‌کند. */
function FingerprintIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 11a3 3 0 0 1 3 3v2a5 5 0 0 1-1.5 3.5M9 19.5A6.5 6.5 0 0 1 12 7a6.5 6.5 0 0 1 6.5 6.5v1.5M12 15v3.5M15.5 12v3.5a3.5 3.5 0 0 1-.7 2.1M5.5 15.5V13A6.5 6.5 0 0 1 12 6.5M8.5 8.8A9 9 0 0 1 21 16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round" />

    </svg>);

}
