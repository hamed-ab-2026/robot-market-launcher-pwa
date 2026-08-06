import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: "/",
        name: "مدیریت روبات مارکت",
        short_name: "روبات مارکت",
        description: "لانچر سریع برای دسترسی به پنل آنلاین و دستگاه محلی روبات مارکت",
        lang: "fa",
        dir: "rtl",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        theme_color: "#00A693",
        background_color: "#f2fffd",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // The two remote UIs (online panel & local device) are external origins
        // and are intentionally NOT cached — they should always be opened fresh.
        navigateFallbackDenylist: [/^\/panel/, /^\/device/]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
