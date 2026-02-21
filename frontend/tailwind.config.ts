/* stylelint-disable-next-line at-rule-no-unknown */

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens do tema "professor" (dark)
        bg: "rgb(var(--bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",

        // Modo aluno (mais chamativo)
        kidbg: "rgb(var(--kidbg) / <alpha-value>)",
        kidcard: "rgb(var(--kidcard) / <alpha-value>)",
        kidtext: "rgb(var(--kidtext) / <alpha-value>)",
        kidprimary: "rgb(var(--kidprimary) / <alpha-value>)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,0,0,.45)",
        card: "0 10px 35px rgba(0,0,0,.35)",
        glow: "0 0 0 1px rgba(255,255,255,.06), 0 18px 60px rgba(0,0,0,.55)",
        primaryGlow: "0 16px 40px rgba(99,102,241,.25)",
        kidGlow: "0 18px 55px rgba(0,0,0,.25)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(80% 60% at 50% 0%, rgba(99,102,241,.25) 0%, rgba(0,0,0,0) 60%)",
        "kid-gradient":
          "linear-gradient(180deg, rgba(99,102,241,.95) 0%, rgba(217,70,239,.85) 45%, rgba(245,158,11,.9) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
