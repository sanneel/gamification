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
        // Dark gaming/premium palette
        ink:        "#0D0D0D",
        surface:    "#111111",
        card:       "#1A1A1A",
        border:     "#2A2A2A",

        // Dopamine accent
        accent:     "#FF2D78",
        "accent-2": "#FF6B6B",

        // Gold — rewards
        gold:       "#FFD700",
        "gold-2":   "#F5A623",

        // Purple — mystery
        violet:     "#7C3AED",
        "violet-2": "#A78BFA",

        // Green — success
        emerald:    "#10B981",

        // Warm partner gifting palette (homepage)
        cream:      "#FAF5EE",
        espresso:   "#3A241D",
        oxblood:    "#8B1A1A",
        paper:      "#FDF8F2",
        blush:      "#EFC9C5",
        "warm-bg":      "#FBF8F4",
        "warm-surface": "#F5EFE8",
        "warm-card":    "#FDFAF7",
        "warm-border":  "#EDE6DC",
        "warm-rose":    "#C8445C",
        "warm-rose-2":  "#E8607A",
        "warm-rose-lt": "#FBDDE2",
        "warm-muted":   "#9C8278",
        "warm-text":    "#1C1410",
        "warm-sub":     "#5C4038",
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        "glow-accent": "0 0 40px rgba(255, 45, 120, 0.5)",
        "glow-gold":   "0 0 40px rgba(255, 215, 0, 0.4)",
        "glow-violet": "0 0 40px rgba(124, 58, 237, 0.5)",
        soft:          "0 4px 24px rgba(0,0,0,0.35)",
        deep:          "0 12px 48px rgba(0,0,0,0.6)",
        // Legacy
        glow:          "0 24px 80px rgba(139, 26, 26, 0.16)",
      },
      backgroundImage: {
        "dopamine-gradient": "linear-gradient(135deg, #FF2D78 0%, #7C3AED 50%, #FF6B6B 100%)",
        "gold-gradient":     "linear-gradient(135deg, #FFD700 0%, #F5A623 100%)",
        "dark-gradient":     "linear-gradient(180deg, #111111 0%, #1A1A1A 100%)",
        "gradient-radial":   "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 45, 120, 0.3)" },
          "50%":      { boxShadow: "0 0 60px rgba(255, 45, 120, 0.9)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        reveal: {
          "0%":   { opacity: "0", transform: "scale(0.8) translateY(20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0px)" },
        },
        "bounce-in": {
          "0%":   { opacity: "0", transform: "scale(0.3)" },
          "50%":  { opacity: "1", transform: "scale(1.05)" },
          "70%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float:        "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer:      "shimmer 2s linear infinite",
        reveal:       "reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "bounce-in":  "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-up":   "slide-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
