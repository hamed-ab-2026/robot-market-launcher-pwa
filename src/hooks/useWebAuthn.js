import { useCallback, useEffect, useState } from "react";




















const CREDENTIAL_ID_KEY = "app_webauthn_credential_id";


/**
 * پشتیبانی دستگاه از احراز هویت داخلی مانند اثرانگشت، Face ID یا Windows Hello را بررسی می‌کند.
 * بررسی ناهمگام است و نتیجه تنها تا زمانی ثبت می‌شود که کامپوننت همچنان Mount باشد.
 */
export function useWebAuthnAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    /** وجود API و یک Platform Authenticator قابل استفاده را از خود مرورگر سؤال می‌کند. */
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

/**
 * عملیات ثبت و استفاده از WebAuthn را برای قفل محلی برنامه کپسوله می‌کند.
 * این پیاده‌سازی سمت کلاینت است و جای اعتبارسنجی WebAuthn توسط سرور را نمی‌گیرد.
 */
export function useWebAuthn() {







  /** یک Credential بایومتریک جدید می‌سازد و فقط شناسه عمومی آن را در مرورگر ذخیره می‌کند. */
  const registerBiometric = useCallback(async (username = "robot-fleet-user") => {



    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Robot Fleet Manager" },
        user: { id: userId, name: username, displayName: username },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000
      }
    });

    if (credential) {


      const id = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      localStorage.setItem(CREDENTIAL_ID_KEY, id);
      return true;
    }
    return false;
  }, []);









  /** با Credential قبلی از سیستم‌عامل درخواست تأیید هویت می‌کند و موفقیت Assertion را برمی‌گرداند. */
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
        allowCredentials: [{ id: rawId, type: "public-key" }],
        userVerification: "required",
        timeout: 60000
      }
    });

    return Boolean(assertion);
  }, []);

  /** مشخص می‌کند آیا قبلاً شناسه یک Credential بایومتریک برای این مرورگر ثبت شده است. */
  const hasBiometricRegistered = useCallback(() => Boolean(localStorage.getItem(CREDENTIAL_ID_KEY)), []);

  return { registerBiometric, authenticateBiometric, hasBiometricRegistered };
}

export default useWebAuthn;
