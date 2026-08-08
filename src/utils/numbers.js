// -----------------------------------------------------------------------
// EN: The reference design shows every number in Persian digits
//     (۱۲۳۴۵۶۷۸۹۰), not Western ones — timestamps, device counts, chart
//     axis labels, everything. This tiny helper converts any
//     string/number to Persian digits so components don't each
//     reimplement the same character map.
// FA: طرح مرجع همه اعداد را با ارقام فارسی نشان می‌دهد، نه غربی —
//     زمان‌ها، تعداد دستگاه‌ها، برچسب‌های نمودار، همه‌جا. این تابع کوچک
//     هر رشته/عدد را به ارقام فارسی تبدیل می‌کند تا کامپوننت‌ها مجبور به
//     پیاده‌سازی تکراری نقشه کاراکترها نباشند.
// -----------------------------------------------------------------------

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * @param {string|number} input - e.g. 248 or "10:25"
 * @returns {string} e.g. "۲۴۸" or "۱۰:۲۵"
 */
export function toPersianDigits(input) {
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

/**
 * EN: Locale-aware formatter — only converts to Persian digits when the
 *     active language is "fa", otherwise returns the value unchanged.
 *     Use this in components instead of calling toPersianDigits directly
 *     so English mode always shows familiar Western numerals.
 * FA: فرمت‌کننده وابسته به زبان — فقط وقتی زبان فعال "fa" باشد به ارقام
 *     فارسی تبدیل می‌کند، در غیر این صورت مقدار را بدون تغییر برمی‌گرداند.
 */
export function formatNumberByLocale(input, language) {
  return language === "fa" ? toPersianDigits(input) : String(input);
}
