import { useState } from "react";
import Header from "./components/Header.jsx";
import ActionCard from "./components/ActionCard.jsx";
import InstallButton from "./components/InstallButton.jsx";
import LocalDeviceForm from "./components/LocalDeviceForm.jsx";
import HelpBox from "./components/HelpBox.jsx";
import { getLocalDeviceIp, setLocalDeviceIp, buildDeviceUrl } from "./utils/deviceStorage.js";

const ONLINE_PANEL_URL = "https://panel.my-rm.com/";

const OnlinePanelIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="13" rx="2" stroke="white" strokeWidth="1.8" />
    <path d="M8 21h8M12 17v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DeviceIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M11 18.5a2 2 0 0 1 2 0"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="19.2" r="0.9" fill="white" />
  </svg>
);

export default function App() {
  const [deviceIp, setDeviceIp] = useState(() => getLocalDeviceIp());

  const openOnlinePanel = () => {
    window.open(ONLINE_PANEL_URL, "_blank", "noopener,noreferrer");
  };

  const openLocalDevice = () => {
    window.location.href = buildDeviceUrl(deviceIp);
  };

  const handleSaveIp = (nextIp) => {
    const saved = setLocalDeviceIp(nextIp);
    setDeviceIp(saved);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 py-8">
        <Header />

        <main className="flex flex-col gap-4">
          <ActionCard
            icon={OnlinePanelIcon}
            title="ورود به پنل آنلاین"
            description="مدیریت دستگاه‌ها، گزارش فروش و وضعیت آنلاین"
            onClick={openOnlinePanel}
            tone="primary"
          />

          <ActionCard
            icon={DeviceIcon}
            title="اتصال به دستگاه"
            description="ورود به تنظیمات محلی دستگاه از طریق وای‌فای"
            onClick={openLocalDevice}
            tone="info"
          />

          <LocalDeviceForm ip={deviceIp} onSave={handleSaveIp} />

          <HelpBox />

          <InstallButton />
        </main>

        <footer className="mt-auto pt-4 text-center">
          <p className="text-[11px] text-slate-400">روبات مارکت · نسخه لانچر</p>
        </footer>
      </div>
    </div>
  );
}
