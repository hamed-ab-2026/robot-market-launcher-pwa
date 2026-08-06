import { useState } from "react";

export default function LocalDeviceForm({ ip, onSave }) {
  const [draft, setDraft] = useState(ip);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card border border-slate-100">
      <label htmlFor="device-ip" className="block text-sm font-bold text-slate-700 mb-1">
        آدرس IP دستگاه
      </label>
      <p className="text-xs text-slate-400 mb-3 leading-5">
        در صورت نیاز آدرس محلی دستگاه را ویرایش کنید. مقدار پیش‌فرض 192.168.4.1 است.
      </p>

      <div className="flex items-center gap-2">
        <input
          id="device-ip"
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="192.168.4.1"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 text-left focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="press-scale shrink-0 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 transition-colors"
        >
          ذخیره
        </button>
      </div>

      {saved && <p className="text-xs text-success mt-2 font-medium">آدرس ذخیره شد</p>}
    </div>
  );
}
