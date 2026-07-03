import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // Watch Dogs ctOS
        wdcyan:    "#00d4ff",
        wdorange:  "#ff6a00",
        wdgreen:   "#4ade80",
        wdbg:      "#030507",
        wdsurface: "#050c14",
        wdtext:    "#8ba9b8",
        wdbright:  "#cce8f4",
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"Share Tech Mono"', '"JetBrains Mono"', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "wd-blink": {
          "0%, 49%":   { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "wd-pulse-border": {
          "0%, 100%": { borderColor: "rgba(0,212,255,0.2)" },
          "50%":       { borderColor: "rgba(0,212,255,0.7)" },
        },
        "wd-flicker": {
          "0%, 93%, 100%": { opacity: "1" },
          "94%": { opacity: "0.82" },
          "96%": { opacity: "1"    },
          "98%": { opacity: "0.91" },
          "99%": { opacity: "1"    },
        },
        "wd-glow": {
          "0%, 100%": { textShadow: "0 0 8px rgba(0,212,255,0.5)" },
          "50%":       { textShadow: "0 0 20px rgba(0,212,255,1), 0 0 50px rgba(0,212,255,0.4)" },
        },
        "wd-slide-in": {
          "0%":   { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%":       { opacity: "1" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "wd-blink":        "wd-blink 1s step-end infinite",
        "wd-pulse-border": "wd-pulse-border 2.5s ease-in-out infinite",
        "wd-flicker":      "wd-flicker 7s infinite",
        "wd-glow":         "wd-glow 2s ease-in-out infinite",
        "wd-slide-in":     "wd-slide-in 0.4s ease-out forwards",
        "fade-up":         "fade-up 0.7s ease-out forwards",
        "fade-in":         "fade-in 0.5s ease-out forwards",
        "glow-pulse":      "glow-pulse 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
