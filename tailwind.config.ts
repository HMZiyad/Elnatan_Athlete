import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0066FF",
          hover: "#0052CC",
        },
        dark: {
          100: "#1A1A1A",
          200: "#121212",
          300: "#0D0D0D",
          400: "#0A0A0A",
        },
        accent: {
          green: "#00FF85",
          white: "#FFFFFF",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Inter Tight", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
