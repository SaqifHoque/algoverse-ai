import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-glass": "var(--surface-glass)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        "border-glass": "var(--border-glass)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2) / <alpha-value>)",
      },
      borderRadius: {
        xl: "var(--radius-lg)",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
