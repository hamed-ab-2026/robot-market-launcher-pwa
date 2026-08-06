const steps = [
  "به وای‌فای دستگاه متصل شوید",
  "مطمئن شوید آدرس دستگاه درست است",
  "سپس روی «اتصال به دستگاه» بزنید"
];

export default function HelpBox() {
  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card border border-slate-100">
      <h2 className="text-sm font-bold text-slate-700 mb-3">راهنمای اتصال</h2>
      <ol className="flex flex-col gap-2.5">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-surface text-primary text-xs font-bold flex items-center justify-center border border-primary/20">
              {index + 1}
            </span>
            <span className="text-xs leading-6 text-slate-500 pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
