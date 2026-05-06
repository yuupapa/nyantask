import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // にゃんタスク パステル基調（モックアップ準拠の暫定値）
        "nyan-pink": "#FFB8C5",
        "nyan-pink-deep": "#FF7B9C",
        "nyan-cream": "#FFF6E5",
        "nyan-blue": "#A8D8FF",
        "nyan-mint": "#B5E8D5",
        "nyan-yellow": "#FFE699",
      },
      fontFamily: {
        sans: ["Hiragino Sans", "Yu Gothic UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
