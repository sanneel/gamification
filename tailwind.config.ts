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
        // Deep dark backgrounds
        ink:        "#080810",
        "ink-2":    "#0E0E1A",
        surface:    "#121220",
        card:       "rgba(255,255,255,0.035)",
        border:     "rgba(255,255,255,0.08)",

        // Accent system
        accent:     "#FF2D78",
        "accent-2": "#FF6B9D",
        violet:     "#7C3AED",
        "violet-2": "#A78BFA",
        gold:       "#FFD700",
        "gold-2":   "#F5A623",
        emerald:    "#10B981",
        "emerald-2":"#34D399",

        // Warm gifting palette (accent tones, not backgrounds)
        blush:      "#FFB5C8",
        rose:       "#FF2D78",
        "warm-rose":"#FF6B9D",
      },

      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },

      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },

      boxShadow: {
        "glow-accent":  "0 0 40px rgba(255, 45, 120, 0.55)",
        "glow-violet":  "0 0 40px rgba(124, 58, 237, 0.55)",
        "glow-gold":    "0 0 40px rgba(255, 215, 0, 0.45)",
        "glow-emerald": "0 0 30px rgba(16, 185, 129, 0.45)",
        "glow-sm":      "0 0 18px rgba(255, 45, 120, 0.35)",
        soft:           "0 4px 24px rgba(0,0,0,0.4)",
        deep:           "0 16px 56px rgba(0,0,0,0.65)",
        "deep-xl":      "0 32px 96px rgba(0,0,0,0.8)",
        card:           "0 8px 32px rgba(0,0,0,0.45)",
        elevated:       "0 2px 8px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.5)",
      },

      backgroundImage: {
        "dopamine-gradient": "linear-gradient(135deg, #FF2D78 0%, #8B1CCA 60%, #7C3AED 100%)",
        "gold-gradient":     "linear-gradient(135deg, #FFD700 0%, #F5A623 100%)",
        "dark-gradient":     "linear-gradient(180deg, #0E0E1A 0%, #080810 100%)",
        "deep-gradient":     "linear-gradient(160deg, #0E0E1A 0%, #080810 60%, #0A0818 100%)",
        "card-gradient":     "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "gradient-radial":   "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "rose-glow":         "radial-gradient(circle, rgba(255,45,120,0.15) 0%, transparent 70%)",
        "violet-glow":       "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 45, 120, 0.3)" },
          "50%":      { boxShadow: "0 0 60px rgba(255, 45, 120, 0.9)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        reveal: {
          "0%":   { opacity: "0", transform: "scale(0.85) translateY(24px)", filter: "blur(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)",       filter: "blur(0)" },
        },
        "bounce-in": {
          "0%":   { opacity: "0", transform: "scale(0.3)" },
          "50%":  { opacity: "1", transform: "scale(1.06)" },
          "70%":  { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        orbit: {
          "0%":   { transform: "rotate(0deg) translateX(40px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(40px) rotate(-360deg)" },
        },
      },

      animation: {
        float:        "float 3.5s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        shimmer:      "shimmer 2.2s linear infinite",
        reveal:       "reveal 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "bounce-in":  "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-up":   "slide-up 0.4s ease-out forwards",
        "spin-slow":  "spin-slow 12s linear infinite",
        orbit:        "orbit 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
