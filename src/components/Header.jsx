export default function Header() {
  return (
    <header className="flex flex-col items-center gap-3 text-center pt-2 pb-1">
      <div className="w-16 h-16 rounded-2xl bg-primary shadow-card flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="4" y="8" width="16" height="12" rx="3" stroke="white" strokeWidth="1.8" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="14" r="1.4" fill="white" />
          <circle cx="15" cy="14" r="1.4" fill="white" />
          <path d="M12 20v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-800">مدیریت روبات مارکت</h1>
      <p className="text-sm leading-6 text-slate-500 max-w-xs">
        یکی از دو مسیر زیر را انتخاب کنید: ورود به پنل آنلاین یا اتصال مستقیم به دستگاه
      </p>
    </header>
  );
}
