import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0f172a",
        brand: "#16a34a",
        amber: {
          DEFAULT: "#f59e0b",
          hover: "#d97706",
        },
        light: {
          bg: "#f8fafc",
          card: "#ffffff",
          text: "#0f172a",
          border: "#e2e8f0",
        },
        dark: {
          bg: "#0f172a",
          card: "#1e293b",
          text: "#f1f5f9",
          border: "#334155",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      transitionProperty: {
        transform: "transform",
      },
    },
  },
  plugins: [],
};
export default config;
