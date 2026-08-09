











const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];





/**
 * یک عدد یا رشته را به متن تبدیل می‌کند و رقم‌های انگلیسی 0 تا 9 را با رقم‌های فارسی جایگزین می‌کند.
 * این تابع فقط شکل نمایش را تغییر می‌دهد و برای محاسبات عددی نباید از خروجی آن استفاده شود.
 */
export function toPersianDigits(input) {
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}









/**
 * مقدار ورودی را متناسب با زبان رابط کاربری آماده نمایش می‌کند.
 * در زبان فارسی رقم‌ها فارسی می‌شوند و در زبان‌های دیگر مقدار بدون تغییر محتوایی برگردانده می‌شود.
 */
export function formatNumberByLocale(input, language) {
  return language === "fa" ? toPersianDigits(input) : String(input);
}
