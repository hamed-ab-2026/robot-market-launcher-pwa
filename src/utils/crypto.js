
export async function sha256Hash(plainText) {


    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(plainText);


    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);


    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

    return hashHex;
}


/**
 * متن واردشده را دوباره هش می‌کند و با هش ذخیره‌شده مقایسه می‌کند.
 * خروجی true به معنی یکسان بودن مقدار ورودی با مقدار اصلی و false به معنی عدم تطابق است.
 */
export async function verifyHash(plainText, storedHash) {
    const computedHash = await sha256Hash(plainText);
    return computedHash === storedHash;
}

const PASSCODE_HASH_KEY = "app_passcode_hash";
const ENCRYPTION_SALT_KEY = "app_encryption_salt";


/** آرایه بایت را به Base64 تبدیل می‌کند تا داده باینری قابل ذخیره در localStorage باشد. */
function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}


/** رشته Base64 ذخیره‌شده را دوباره به آرایه بایت مورد نیاز Web Crypto تبدیل می‌کند. */
function base64ToBytes(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}


/**
 * Salt اختصاصی رمزنگاری را از حافظه می‌خواند یا در اولین اجرا یک Salt تصادفی می‌سازد.
 * Salt محرمانه نیست، اما باعث می‌شود کلید مشتق‌شده بین نصب‌های مختلف یکسان نباشد.
 */
function getOrCreateEncryptionSalt() {
    const storedSalt = localStorage.getItem(ENCRYPTION_SALT_KEY);
    if (storedSalt) return base64ToBytes(storedSalt);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(ENCRYPTION_SALT_KEY, bytesToBase64(salt));
    return salt;
}


/**
 * با استفاده از هش PIN، Salt و الگوریتم PBKDF2 یک کلید ۲۵۶ بیتی AES-GCM تولید می‌کند.
 * کلید خروجی قابل استخراج نیست و فقط عملیات رمزنگاری و رمزگشایی را در همان مرورگر انجام می‌دهد.
 */
async function deriveLocalEncryptionKey() {
    const passcodeHash = localStorage.getItem(PASSCODE_HASH_KEY);
    if (!passcodeHash) throw new Error("NO_APP_PASSCODE");

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passcodeHash),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: getOrCreateEncryptionSalt(),
            iterations: 150000,
            hash: "SHA-256"
        },
        keyMaterial,
        {name: "AES-GCM", length: 256},
        false,
        ["encrypt", "decrypt"]
    );
}


/**
 * متن حساس مانند رمز دستگاه را با AES-GCM رمزنگاری می‌کند.
 * برای هر بار رمزنگاری IV تصادفی تازه ساخته می‌شود و خروجی شامل نسخه، IV و داده رمز‌شده است.
 */
export async function encryptSecret(plainText) {
    if (!plainText) return "";

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveLocalEncryptionKey();
    const encrypted = await crypto.subtle.encrypt(
        {name: "AES-GCM", iv},
        key,
        new TextEncoder().encode(plainText)
    );

    return JSON.stringify({
        version: 1,
        iv: bytesToBase64(iv),
        data: bytesToBase64(new Uint8Array(encrypted))
    });
}


/**
 * بسته ساخته‌شده توسط encryptSecret را با کلید محلی رمزگشایی می‌کند.
 * اگر PIN یا Salt تغییر کرده باشد، Web Crypto خطا می‌دهد تا داده اشتباه نمایش داده نشود.
 */
export async function decryptSecret(payload) {
    if (!payload) return "";

    const parsed = JSON.parse(payload);
    const key = await deriveLocalEncryptionKey();
    const decrypted = await crypto.subtle.decrypt(
        {name: "AES-GCM", iv: base64ToBytes(parsed.iv)},
        key,
        base64ToBytes(parsed.data)
    );

    return new TextDecoder().decode(decrypted);
}
