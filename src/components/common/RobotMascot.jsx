import React from "react";

// -----------------------------------------------------------------------
// EN: A single original SVG robot mascot used in two sizes across the
//     app: a small "mark" version (logo, sidebar) and a larger
//     "illustration" version (auth screen, splash). Kept as one
//     component with a `variant` prop so the character never drifts
//     between screens.
// FA: یک ماسکات ربات SVG اصلی که در دو اندازه استفاده می‌شود: نسخه
//     کوچک "نشان" (لوگو، سایدبار) و نسخه بزرگ "تصویرسازی" (صفحه ورود،
//     اسپلش). به‌صورت یک کامپوننت با prop به نام variant نگه داشته شده
//     تا شخصیت در صفحات مختلف تغییر نکند.
// -----------------------------------------------------------------------

export default function RobotMascot({ variant = "mark", className = "" }) {
  if (variant === "mark") {
    // Compact head-only mark, used as the app logo (sidebar, headers).
    return (
      <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="36" height="36" rx="12" fill="#00A693" />
        <circle cx="12" cy="8" r="1.6" fill="#00A693" />
        <circle cx="28" cy="8" r="1.6" fill="#00A693" />
        <rect x="11" y="6.5" width="2" height="4" rx="1" fill="#ffffff" />
        <rect x="27" y="6.5" width="2" height="4" rx="1" fill="#ffffff" />
        <rect x="9" y="13" width="22" height="17" rx="8" fill="#ffffff" />
        <circle cx="16" cy="21" r="2.6" fill="#00A693" />
        <circle cx="24" cy="21" r="2.6" fill="#00A693" />
      </svg>
    );
  }

  // "illustration" variant: full friendly robot body, used on the Auth
  // screen and Splash screen for a warmer, on-brand welcome moment.
  return (
    <svg viewBox="0 0 160 180" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* antennae */}
      <circle cx="58" cy="18" r="5" fill="#00A693" />
      <circle cx="102" cy="18" r="5" fill="#00A693" />
      <rect x="55.5" y="20" width="5" height="16" rx="2.5" fill="#B9EDE4" />
      <rect x="99.5" y="20" width="5" height="16" rx="2.5" fill="#B9EDE4" />

      {/* head */}
      <rect x="35" y="34" width="90" height="70" rx="30" fill="#ffffff" stroke="#DFF7F2" strokeWidth="3" />
      <rect x="50" y="54" width="60" height="34" rx="17" fill="#0F2A27" />
      <circle cx="70" cy="71" r="7" fill="#00A693" />
      <circle cx="90" cy="71" r="7" fill="#00A693" />
      <circle cx="72.5" cy="68.5" r="2" fill="#ffffff" />
      <circle cx="92.5" cy="68.5" r="2" fill="#ffffff" />

      {/* ears */}
      <rect x="24" y="58" width="11" height="22" rx="5.5" fill="#00A693" />
      <rect x="125" y="58" width="11" height="22" rx="5.5" fill="#00A693" />

      {/* body */}
      <rect x="45" y="108" width="70" height="58" rx="24" fill="#ffffff" stroke="#DFF7F2" strokeWidth="3" />
      <rect x="63" y="122" width="34" height="10" rx="5" fill="#DFF7F2" />
      <circle cx="80" cy="150" r="9" fill="#00A693" />

      {/* arms */}
      <rect x="20" y="118" width="14" height="34" rx="7" fill="#B9EDE4" />
      <rect x="126" y="118" width="14" height="34" rx="7" fill="#B9EDE4" />
    </svg>
  );
}
