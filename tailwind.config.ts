import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#181513",
        paper: "#fffaf2",
        berry: "#d64045",
        mint: "#2a9d8f",
        gold: "#f4a261"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(24, 21, 19, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
