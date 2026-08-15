/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom slate shades used across the app for the premium dark theme
        slate: {
          850: "#16202f",
          750: "#2a3649",
          450: "#7c8ba3",
          350: "#b0bccb",
        },
      },
      fontSize: {
        "2xs": ["0.6875rem", "0.9375rem"],
      },
      spacing: {
        4.5: "1.125rem",
      },
      transitionDuration: {
        350: "350ms",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "4rem 4rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-up": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        aurora: {
          "0%, 100%": { opacity: "0.5", transform: "translate(0, 0) scale(1)" },
          "33%": { opacity: "0.8", transform: "translate(4%, -4%) scale(1.05)" },
          "66%": { opacity: "0.6", transform: "translate(-3%, 3%) scale(0.98)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0px rgba(16,185,129,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(16,185,129,0.45)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "scale-up": "scale-up 0.25s ease-out both",
        shimmer: "shimmer 2s infinite linear",
        aurora: "aurora 12s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      boxShadow: {
        "glow-emerald": "0 0 24px rgba(16,185,129,0.35)",
        "glow-purple": "0 0 24px rgba(139,92,246,0.35)",
        "glow-blue": "0 0 24px rgba(59,130,246,0.3)",
        "card-dark": "0 10px 40px -12px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
