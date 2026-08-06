export default function ActionCard({ icon, title, description, onClick, tone = "primary" }) {
  const toneStyles = {
    primary: "bg-primary hover:bg-primary-hover",
    info: "bg-info hover:bg-primary-hover"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="press-scale group w-full flex items-center gap-4 rounded-xl2 bg-white p-4 text-right shadow-card hover:shadow-card-hover transition-shadow border border-slate-100"
    >
      <span
        className={`shrink-0 w-14 h-14 rounded-2xl text-white flex items-center justify-center transition-colors ${toneStyles[tone]}`}
      >
        {icon}
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-base font-bold text-slate-800">{title}</span>
        <span className="block text-xs leading-5 text-slate-500 mt-1">{description}</span>
      </span>

      <svg
        className="shrink-0 w-5 h-5 text-slate-300 group-hover:text-primary transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
