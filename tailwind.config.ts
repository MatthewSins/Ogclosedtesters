import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#060816",
        foreground: "#eef1ff",
        primary: "#42d3ff",
        secondary: "#915eff",
        accent: "#00ffa3",
        surface: "rgba(255,255,255,0.08)"
      },
      boxShadow: {
        neon: "0 0 24px rgba(66, 211, 255, 0.45)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.35)",
        violet: "0 0 30px rgba(145, 94, 255, 0.35)"
      },
      backdropBlur: {
        xs: "2px"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.75", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite",
        marquee: "marquee 16s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
