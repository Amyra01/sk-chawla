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
        // sk chawla palette — Midnight Ink · Deep Navy · Royal Sapphire · Antique Gold · Ivory
        white: "#F7F2E8", // Ivory (warm headings & body highlights)
        obsidian: "#0A0F1C", // Midnight Ink (page background)
        charcoal: "#111827", // Deep Navy surface
        navy: "#18233F", // Elevated navy surface
        sapphire: "#4F74E8", // Royal Sapphire (secondary accent)
        gold: "#E0B860", // Antique Gold (primary accent)
        mutedText: "#AEB6C6", // Soft slate body text
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F2D892 0%, #E0B860 45%, #C08F35 100%)",
        "navy-radial": "radial-gradient(circle at 50% 0%, rgba(79, 116, 232, 0.16), rgba(10, 15, 28, 0) 65%)",
      },
      boxShadow: {
        "gold-glow": "0 0 30px -6px rgba(224, 184, 96, 0.5)",
        "sapphire-glow": "0 0 30px -5px rgba(79, 116, 232, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
