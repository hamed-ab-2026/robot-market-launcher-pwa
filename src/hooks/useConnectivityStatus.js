import { useCallback, useEffect, useState } from "react";

const CHECK_INTERVAL_MS = 30_000;
const CHECK_TIMEOUT_MS = 5_000;
const DEFAULT_CHECK_URL = "https://www.gstatic.com/generate_204";

export function useConnectivityStatus() {
  const [status, setStatus] = useState("checking");

  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus("offline");
      return false;
    }

    setStatus("checking");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
      const configuredUrl = import.meta.env.VITE_CONNECTIVITY_CHECK_URL || DEFAULT_CHECK_URL;
      const url = new URL(configuredUrl, window.location.origin);
      url.searchParams.set("_connectivity", Date.now().toString());
      await fetch(url, {
        method: "GET",
        mode: url.origin === window.location.origin ? "same-origin" : "no-cors",
        cache: "no-store",
        signal: controller.signal
      });
      setStatus("online");
      return true;
    } catch {
      setStatus("offline");
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = window.setInterval(checkConnection, CHECK_INTERVAL_MS);
    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
    };
  }, [checkConnection]);

  return { status, checkConnection };
}

export default useConnectivityStatus;
