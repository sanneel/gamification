import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:      "#0B0B0C",
        "ink-2":  "#131316",
        "ink-3":  "#1A1B1F",
        bone:     "#F2EFE9",
        "bone-2": "#E8E3D8",
        "bone-3": "#DDD6C7",
        paper:    "#FBF9F4",
        accent:   "#C7724B",
        "accent-2": "#E89972",
        // Retained for legacy spin-wheel and admin surfaces
        butter:   "#F2EFE9",
        "butter-2": "#E8E3D8",
        storm:    "#0B0B0C",
        "storm-2":"#131316",
        "storm-3":"#1A1B1F",
        violet:   "#7C3AED",
        gold:     "#FFD700",
        emerald:  "#10B981",
      },

      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        serif:   ["var(--font-serif)", "Georgia", "serif"],
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "36": "9rem",
        "44": "11rem",
        "52": "13rem",
        "60": "15rem",
      },

      maxWidth: {
        "8xl": "88rem",
        "9xl": "100rem",
        "10xl": "120rem",
      },

      letterSpacing: {
        wider: "0.18em",
        widest: "0.32em",
      },

      borderColor: {
        DEFAULT: "rgba(11,11,12,0.12)",
      },

      boxShadow: {
        "edge":     "0 1px 0 rgba(11,11,12,0.06)",
        "frame":    "0 0 0 1px rgba(11,11,12,0.1)",
        "deep":     "0 30px 80px -20px rgba(11,11,12,0.45)",
        "card":     "0 24px 48px -24px rgba(11,11,12,0.35)",
        "glow-ink": "0 0 60px rgba(11,11,12,0.5)",
      },

      backgroundImage: {
        "ink-gradient":   "linear-gradient(180deg, #0B0B0C 0%, #131316 100%)",
        "bone-gradient":  "linear-gradient(180deg, #FBF9F4 0%, #E8E3D8 100%)",
        "accent-gradient":"linear-gradient(180deg, #E89972 0%, #C7724B 100%)",
        "gradient-radial":"radial-gradient(var(--tw-gradient-stops))",
      },

      keyframes: {
        "fade-up":   { "0%": { opacity: "0", transform: "translateY(28px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in":   { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up":  { "0%": { opacity: "0", transform: "translateY(40px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer:     { "0%": { backgroundPosition: "200% center" }, "100%": { backgroundPosition: "-200% center" } },
        "blink-soft":{ "0%,100%": { opacity: "0.2" }, "50%": { opacity: "1" } },
        "line-grow": { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
        "bounce-in": { "0%": { opacity: "0", transform: "scale(0.3)" }, "50%": { opacity: "1", transform: "scale(1.06)" }, "100%": { transform: "scale(1)" } },
      },

      animation: {
        "fade-up":    "fade-up 0.95s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":    "fade-in 0.6s ease-out forwards",
        "slide-up":   "slide-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer:      "shimmer 2.4s linear infinite",
        "blink-soft": "blink-soft 1.6s ease-in-out infinite",
        "line-grow":  "line-grow 1.4s cubic-bezier(0.77,0,0.175,1) forwards",
        "bounce-in":  "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
