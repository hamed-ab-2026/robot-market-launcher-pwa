// -----------------------------------------------------------------------
// EN: We NEVER store the raw 6-digit passcode. Instead we store its
//     SHA-256 hash. Even though a 6-digit code is inherently low-entropy
//     (only 1,000,000 combinations) and hashing alone won't stop a
//     determined brute-force attacker, it still protects the passcode
//     from a casual look at localStorage / DevTools, and matches the
//     spec's requirement. Real production systems should also add a
//     server-side rate limit or a hardware-backed secure enclave.
// FA: ما هرگز رمز عبور ۶ رقمی خام را ذخیره نمی‌کنیم. به‌جای آن، هش
//     SHA-256 آن را ذخیره می‌کنیم. اگرچه یک کد ۶ رقمی ذاتاً آنتروپی کمی
//     دارد، هش کردن حداقل از دیدن مستقیم رمز در localStorage/DevTools
//     جلوگیری می‌کند و نیازمندی این پروژه را برآورده می‌سازد.
// -----------------------------------------------------------------------

/**
 * EN: Hashes a plain string using SHA-256 via the browser's native
 *     Web Crypto API (`crypto.subtle`). No external hashing library is
 *     needed — every modern browser (and every PWA-capable one) ships
 *     this API natively, over HTTPS or localhost.
 *
 * FA: یک رشته ساده را با استفاده از الگوریتم SHA-256 و API بومی مرورگر
 *     (crypto.subtle) هش می‌کند. نیازی به کتابخانه خارجی نیست چون همه
 *     مرورگرهای مدرن (که قابلیت PWA دارند) این API را به‌صورت داخلی دارند.
 *
 * @param {string} plainText - e.g. the 6-digit passcode "123456"
 * @returns {Promise<string>} hex-encoded hash, e.g. "8d969eef6ec..."
 */
export async function sha256Hash(plainText) {
  // Step 1 (EN): Convert the string into raw bytes (UTF-8).
  // مرحله ۱ (FA): رشته را به بایت‌های خام (UTF-8) تبدیل می‌کنیم.
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(plainText);

  // Step 2 (EN): Ask the browser to compute the SHA-256 digest.
  //              This returns an ArrayBuffer, not a readable string yet.
  // مرحله ۲ (FA): از مرورگر می‌خواهیم دایجست SHA-256 را محاسبه کند.
  //              خروجی یک ArrayBuffer است، هنوز رشته قابل‌خواندن نیست.
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);

  // Step 3 (EN): Convert the ArrayBuffer into a regular array of bytes,
  //              then map each byte to a 2-character hex string, and
  //              join them into the final hash string.
  // مرحله ۳ (FA): ArrayBuffer را به آرایه‌ای از بایت‌ها تبدیل کرده،
  //              هر بایت را به یک رشته هگز ۲ کاراکتری تبدیل می‌کنیم
  //              و در نهایت همه را به هم می‌چسبانیم.
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * EN: Compares a plain passcode against a previously-stored hash by
 *     re-hashing the plain value and doing a string comparison.
 *     (We can't "decrypt" a hash — hashing is one-way by design.)
 * FA: یک رمز ساده را با هش ذخیره‌شده مقایسه می‌کند؛ چون هش برگشت‌ناپذیر
 *     است، رمز ورودی را دوباره هش کرده و دو رشته هش را مقایسه می‌کنیم.
 *
 * @param {string} plainText
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyHash(plainText, storedHash) {
  const computedHash = await sha256Hash(plainText);
  return computedHash === storedHash;
}
