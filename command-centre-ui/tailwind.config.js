/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "neon-cyan": "#00f0ff",
        "neon-purple": "#a855f7",
        "dark-bg": "#0a0a0f",
        "dark-card": "#111119",
        "dark-border": "#1e1e2e",
        "dark-hover": "#16161f",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 240, 255, 0.15)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.15)",
        "glow-cyan-lg": "0 0 40px rgba(0, 240, 255, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 240, 255, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 240, 255, 0.3)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
