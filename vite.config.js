import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";


export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",


            devOptions: {
                enabled: true,
                type: "module"
            },
            includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
            manifest: {
                id: "/",
                name: "Robot Market Manager",
                short_name: "RobotMarket",
                description: "Professional hardware management dashboard for robot Market",
                lang: "fa",
                dir: "rtl",
                theme_color: "#00A693",
                background_color: "#f2fffd",


                display: "standalone",
                display_override: ["standalone"],
                orientation: "portrait-primary",
                start_url: "/",
                scope: "/",
                icons: [
                    {src: "icons/icon-192.png", sizes: "192x192", type: "image/png"},
                    {src: "icons/icon-512.png", sizes: "512x512", type: "image/png"},
                    {src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable"}]

            },
            workbox: {

                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,woff2}"
                ],


                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true
            }
        })],

    server: {
        port: 5173,
        host: true
    }
});
