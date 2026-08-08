import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// -----------------------------------------------------------------------
// EN: Vite configuration. The VitePWA plugin auto-generates the Service
//     Worker + injects the manifest link, which is what makes
//     `window.matchMedia('(display-mode: standalone)')` become true
//     once the user installs the app (see src/hooks/useIsStandalone.js).
//
//     ROOT CAUSE of "opens in a browser tab despite having a manifest":
//     by default VitePWA does NOT inject the manifest link or register
//     a Service Worker during `vite dev` — it only does that in a
//     production build. So testing installability against `npm run dev`
//     will always fail silently, with no error, no matter how correct
//     manifest.json is. `devOptions.enabled: true` below turns that on
//     for local development too.
// FA: تنظیمات Vite. پلاگین VitePWA به‌صورت خودکار Service Worker می‌سازد
//     و لینک مانیفست را تزریق می‌کند. همین باعث می‌شود بعد از نصب اپ،
//     حالت standalone فعال شود.
//
//     ریشه مشکل "باز شدن در تب مرورگر با وجود مانیفست": به‌صورت پیش‌فرض
//     VitePWA لینک مانیفست یا Service Worker را در حالت `vite dev` تزریق
//     نمی‌کند — فقط در build نهایی این کار را انجام می‌دهد. پس تست نصب
//     روی npm run dev همیشه بدون خطا شکست می‌خورد. devOptions.enabled
//     همین را برای توسعه محلی هم فعال می‌کند.
// -----------------------------------------------------------------------
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Enables manifest injection + SW registration during `npm run dev`,
      // not just `npm run build`. Without this, `npm run dev` can NEVER
      // be installed as a PWA, which is the #1 cause of "why is this
      // still opening in a browser tab" during local testing.
      devOptions: {
        enabled: true,
        type: "module"
      },
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: "/", // stable app identity across updates — prevents browsers from treating an updated manifest as a "different" app
        name: "Robot Fleet Manager",
        short_name: "RobotFleet",
        description: "Professional hardware management dashboard for robot fleets",
        lang: "fa", // matches the app's actual default language (see src/i18n/index.js)
        dir: "rtl",
        theme_color: "#00A693",
        background_color: "#f2fffd",
        // Strict standalone: no address bar, no browser chrome. "standalone"
        // (rather than "minimal-ui" or "browser") is what makes
        // `matchMedia('(display-mode: standalone)')` resolve to true.
        display: "standalone",
        display_override: ["standalone"], // hard-blocks any browser fallback to a less strict mode
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/", // every URL under "/" is considered part of the installed app's boundary
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Cache the app shell so the InstallGate/Splash still work offline.
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // --- Cache-invalidation strategy for an already-installed PWA ---
        // cleanupOutdatedCaches: deletes old precache versions as soon as
        //   a new Service Worker activates, instead of leaving stale
        //   manifest/asset caches sitting around indefinitely.
        // clientsClaim + skipWaiting (paired with registerType:"autoUpdate"
        //   above): the new Service Worker takes control of ALL open tabs
        //   immediately on activation, instead of waiting for every tab
        //   to be closed and reopened first.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
