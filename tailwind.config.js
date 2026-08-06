/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00A693",
          hover: "#009b89"
        },
        surface: "#f2fffd",
        success: "#00ab97",
        error: "#005148",
        info: "#00bba6"
      },
      fontFamily: {
        vazir: ["Vazirmatn", "Tahoma", "sans-serif"]
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(0, 166, 147, 0.25)",
        "card-hover": "0 12px 32px -8px rgba(0, 166, 147, 0.35)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
