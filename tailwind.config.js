/** @type {import('tailwindcss').Config} */
export default {
  // "class" strategy => Redux (uiSlice) toggles the `dark` class on <html>.
  // This keeps Tailwind's dark mode in sync with our own persisted state
  // instead of relying only on the OS `prefers-color-scheme`.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — reused everywhere instead of hardcoded hex values
        // so a future re-theme only touches this one file.
        brand: {
          DEFAULT: "#00A693",
          50: "#e6faf7",
          100: "#ccf5ef",
          200: "#99ebdf",
          300: "#66e0cf",
          400: "#33d6bf",
          500: "#00A693",
          600: "#008576",
          700: "#00645a",
          800: "#00423d",
          900: "#00211f"
        },
        surface: {
          light: "#f2fffd",
          dark: "#0b1615"
        },
        // Semantic status colors — used consistently across the donut
        // legend, table status pills, and activity icons so "online"
        // always means the same teal dot everywhere in the app.
        status: {
          online: "#00A693",
          offline: "#CBD5E1",
          pending: "#FFC53D",
          error: "#F04438"
        }
      },
      fontFamily: {
        // Vazirmatn renders both Persian and Latin glyphs cleanly, so we
        // use a single font-family for both languages instead of swapping
        // fonts on locale change (fewer layout-shift bugs).
        sans: ["Vazirmatn", "Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        "pulse-logo": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" }
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" }
        }
      },
      animation: {
        "pulse-logo": "pulse-logo 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        shake: "shake 0.4s ease-in-out"
      }
    }
  },
  // corePlugins.preflight stays on; RTL is handled via the `dir` attribute
  // on <html> (set in src/i18n/index.js) rather than a Tailwind RTL plugin,
  // which keeps the dependency list smaller and easier for juniors to trace.
  plugins: []
};
