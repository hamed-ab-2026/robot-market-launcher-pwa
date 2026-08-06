import { useInstallPrompt } from "../hooks/useInstallPrompt.js";

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallButton() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  if (isInstalled) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {isInstallable && (
        <button
          type="button"
          onClick={promptInstall}
          className="press-scale w-full flex items-center justify-center gap-2 rounded-xl2 bg-white border-2 border-primary text-primary font-bold py-3 shadow-card hover:bg-primary hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          نصب برنامه
        </button>
      )}

      {isIos() && (
        <p className="text-xs text-slate-400 text-center leading-5">
          در آیفون از Share &gt; Add to Home Screen استفاده کنید.
        </p>
      )}
    </div>
  );
}
