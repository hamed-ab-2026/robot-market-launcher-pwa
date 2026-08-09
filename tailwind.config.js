
export default {

  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {


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



        status: {
          online: "#00A693",
          offline: "#CBD5E1",
          pending: "#FFC53D",
          error: "#F04438"
        }
      },
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"]
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



  plugins: []
};
