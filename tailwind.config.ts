import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── MINIMALIST CANVAS ─────────────────────────────────
        butter:   "#F5E6A3",
        "butter-2": "#EDD98A",
        storm:    "#3A4A5C",
        "storm-2": "#4E6070",
        "storm-3": "#2A3847",

        // ── Legacy dark palette (spin wheel, overlays) ────────
        ink:     "#080810",
        accent:  "#FF2D78",
        violet:  "#7C3AED",
        gold:    "#FFD700",
        emerald: "#10B981",
      },

      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "36": "9rem",
        "44": "11rem",
      },

      maxWidth: {
        "8xl": "88rem",
        "9xl": "100rem",
      },

      borderColor: {
        DEFAULT: "rgba(58,74,92,0.18)",
      },

      boxShadow: {
        canvas: "0 4px 24px rgba(58,74,92,0.08)",
        "canvas-md": "0 8px 40px rgba(58,74,92,0.12)",
        "canvas-lg": "0 16px 64px rgba(58,74,92,0.16)",
        "frame": "0 2px 12px rgba(58,74,92,0.1), 0 0 0 1px rgba(58,74,92,0.12)",
        // Legacy dark
        "glow-accent": "0 0 40px rgba(255,45,120,0.5)",
        deep: "0 16px 56px rgba(0,0,0,0.65)",
      },

      backgroundImage: {
        "butter-gradient": "linear-gradient(180deg, #F5E6A3 0%, #EDD98A 100%)",
        "storm-gradient":  "linear-gradient(180deg, #3A4A5C 0%, #2A3847 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },

      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        // Legacy
        "bounce-in": {
          "0%":   { opacity: "0", transform: "scale(0.3)" },
          "50%":  { opacity: "1", transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,45,120,0.3)" },
          "50%":      { boxShadow: "0 0 60px rgba(255,45,120,0.9)" },
        },
      },

      animation: {
        "fade-up":   "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":   "fade-in 0.6s ease-out forwards",
        "slide-up":  "slide-up 0.5s ease-out forwards",
        shimmer:     "shimmer 2.2s linear infinite",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "pulse-glow":"pulse-glow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
