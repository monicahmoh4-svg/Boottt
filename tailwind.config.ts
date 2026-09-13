import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0b0f17",
          panel: "#111827",
          border: "#1f2937",
          accent: "#10b981",
          danger: "#ef4444",
          warn: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
