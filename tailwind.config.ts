import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "#007c95",
        "accent-dark": "#00677c",
        border: "#d7e3ea",
        background: "#f4fbfd",
        foreground: "#0f2133",
        muted: "#5f7082"
      },
      boxShadow: {
        soft: "0 14px 36px rgba(15, 33, 51, 0.08)",
        card: "0 18px 50px rgba(15, 33, 51, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
