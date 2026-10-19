import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paypal: {
          blue: "#0070E0",
          hover: "#005EA6",
          dark: "#003087",
          navy: "#012169",
          sky: "#9BD4FF",
          light: "#F5F7FA",
          border: "#E6E9ED",
        },
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        modal: "0 12px 40px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
