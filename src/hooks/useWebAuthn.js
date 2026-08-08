import {useCallback, useEffect, useState} from "react";

// -----------------------------------------------------------------------
// EN: A small wrapper around the browser's WebAuthn API for local
//     Fingerprint/Face ID unlock. This is a SIMPLIFIED, client-only demo:
//     real WebAuthn normally needs a backend to generate/verify
//     challenges and store public keys. Since this app's passcode is
//     also fully local (SHA-256 hash in localStorage — see utils/crypto.js),
//     we mirror that approach here: we register a platform authenticator
//     credential and simply check that the browser can produce *a*
//     signed assertion for it. This is enough to gate a local UI, but
//     should NOT be treated as server-verified authentication.
//
// FA: یک wrapper کوچک روی WebAuthn برای باز کردن قفل با اثرانگشت/فیس‌آیدی.
//     این یک نسخه ساده‌شده و کاملاً سمت کلاینت است: WebAuthn واقعی معمولاً
//     به بک‌اند برای تولید/تأیید چالش‌ها نیاز دارد. چون رمز عبور این اپ هم
//     کاملاً محلی است (هش SHA-256 در localStorage)، همین رویکرد را اینجا
//     هم تکرار می‌کنیم: یک credential محلی ثبت می‌کنیم و فقط بررسی
//     می‌کنیم که مرورگر بتواند یک assertion امضاشده برایش تولید کند.
// -----------------------------------------------------------------------

const CREDENTIAL_ID_KEY = "app_webauthn_credential_id";

/** EN: Checks whether the device has a platform authenticator available (Face ID / fingerprint / Windows Hello). */
export function useWebAuthnAvailability() {
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            const supported =
                typeof window !== "undefined" &&
                window.PublicKeyCredential &&
                typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";

            if (!supported) {
                setIsAvailable(false);
                return;
            }

            try {
                const result = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (!cancelled) setIsAvailable(result);
            } catch {
                if (!cancelled) setIsAvailable(false);
            }
        }

        check();
        return () => {
            cancelled = true;
        };
    }, []);

    return isAvailable;
}

export function useWebAuthn() {
    /**
     * EN: Step 1 — Registration. Call this once, right after the user sets
     *     up their 6-digit passcode, to also register a biometric credential
     *     tied to this device/browser.
     * FA: مرحله ۱ — ثبت‌نام. این تابع یک‌بار، بلافاصله بعد از تنظیم رمز
     *     ۶ رقمی، یک credential بیومتریک متصل به این دستگاه/مرورگر ثبت می‌کند.
     */
    const registerBiometric = useCallback(async (username = "robot-fleet-user") => {
        // A random challenge — in a real backend-verified flow this MUST come
        // from the server. Here it's generated client-side since there's no
        // backend to verify against (local-only demo, see file header).
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const userId = crypto.getRandomValues(new Uint8Array(16));

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {name: "Robot Fleet Manager"},
                user: {id: userId, name: username, displayName: username},
                pubKeyCredParams: [{alg: -7, type: "public-key"}], // ES256
                authenticatorSelection: {
                    authenticatorAttachment: "platform", // forces built-in Face ID / fingerprint, not a USB key
                    userVerification: "required"
                },
                timeout: 60000
            }
        });

        if (credential) {
            // Store only the credential ID (public, not secret) so we can
            // request an assertion against it later during unlock.
            const id = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            localStorage.setItem(CREDENTIAL_ID_KEY, id);
            return true;
        }
        return false;
    }, []);

    /**
     * EN: Step 2 — Assertion. Call this on the unlock screen when the user
     *     taps "Use biometrics". Prompts Face ID/fingerprint and resolves
     *     true if the OS confirms the user's identity.
     * FA: مرحله ۲ — تأیید. هنگام زدن دکمه «ورود با بیومتریک» این تابع را
     *     صدا بزنید. فیس‌آیدی/اثرانگشت را باز می‌کند و در صورت تأیید هویت
     *     توسط سیستم‌عامل، true برمی‌گرداند.
     */
    const authenticateBiometric = useCallback(async () => {
        const storedId = localStorage.getItem(CREDENTIAL_ID_KEY);
        if (!storedId) {
            throw new Error("NO_BIOMETRIC_REGISTERED");
        }

        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const rawId = Uint8Array.from(atob(storedId), (c) => c.charCodeAt(0));

        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge,
                allowCredentials: [{id: rawId, type: "public-key"}],
                userVerification: "required",
                timeout: 60000
            }
        });

        return Boolean(assertion);
    }, []);

    const hasBiometricRegistered = useCallback(() => Boolean(localStorage.getItem(CREDENTIAL_ID_KEY)), []);

    return {registerBiometric, authenticateBiometric, hasBiometricRegistered};
}

export default useWebAuthn;
