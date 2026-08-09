import React, { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { formatNumberByLocale } from "../../utils/numbers";


















const KEYPAD_LAYOUT = [
["1", "2", "3"],
["4", "5", "6"],
["7", "8", "9"]];


/**
 * صفحه‌کلید عددی کنترل‌شده برای ورود PIN است و مقدار را مستقیماً نگهداری نمی‌کند.
 * ورودی لمس و صفحه‌کلید فیزیکی را یکسان مدیریت می‌کند و با رسیدن به طول مجاز امکان ارسال را فراهم می‌سازد.
 */
export default function NumericKeypad({
  value,
  onChange,
  onSubmit,
  length = 6,
  isError = false,
  disabled = false
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.resolvedLanguage !== "en";
  const ConfirmIcon = isRtl ? ArrowLeftOutlined : ArrowRightOutlined;

  /** یک رقم را فقط در صورت فعال بودن و نرسیدن به حداکثر طول به مقدار فعلی اضافه می‌کند. */
  const appendDigit = useCallback(
    (digit) => {
      if (disabled) return;
      if (value.length >= length) return;
      if (navigator.vibrate) navigator.vibrate(8);
      onChange(value + digit);
    },
    [disabled, value, length, onChange]
  );

  /** آخرین رقم مقدار فعلی را حذف می‌کند و برای کلید Backspace نیز استفاده می‌شود. */
  const removeLastDigit = useCallback(() => {
    if (disabled) return;
    if (value.length === 0) return;
    onChange(value.slice(0, -1));
  }, [disabled, value, onChange]);


  useEffect(() => {
    /** کلیدهای عددی، Backspace و Enter صفحه‌کلید فیزیکی را به عملیات متناظر تبدیل می‌کند. */
    function handleKeyDown(e) {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        appendDigit(e.key);
      } else if (e.key === "Backspace") {
        removeLastDigit();
      } else if (e.key === "Enter" && value.length === length) {
        onSubmit?.(value);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appendDigit, removeLastDigit, disabled, value, length, onSubmit]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYPAD_LAYOUT.flat().map((digit) =>
      <KeypadButton key={digit} onClick={() => appendDigit(digit)} disabled={disabled}>
          {formatNumberByLocale(digit, i18n.resolvedLanguage)}
        </KeypadButton>
      )}

      <button
        type="button"
        aria-label={t("auth.delete")}
        onClick={removeLastDigit}
        disabled={disabled || value.length === 0}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-lg text-slate-500 shadow-sm transition active:scale-95 disabled:opacity-30 dark:bg-slate-700 dark:text-slate-300">

        <DeleteOutlined />
      </button>

      <KeypadButton onClick={() => appendDigit("0")} disabled={disabled}>
        {formatNumberByLocale(0, i18n.resolvedLanguage)}
      </KeypadButton>

      <button
        type="button"
        aria-label={t("common.confirm")}
        onClick={() => value.length === length && onSubmit?.(value)}
        disabled={disabled || value.length !== length}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-lg text-white shadow-sm shadow-brand-500/30 transition active:scale-95 disabled:opacity-40">

        <ConfirmIcon />
      </button>
    </div>);

}


/** ظاهر و رفتار مشترک تمام کلیدهای عددی و عملیاتی صفحه‌کلید را یکجا نگهداری می‌کند. */
function KeypadButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100 transition active:scale-95 active:bg-brand-50 disabled:opacity-40 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:active:bg-slate-700">

      {children}
    </button>);

}
