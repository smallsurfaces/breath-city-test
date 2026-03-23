import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── shadcn/ui semantic token wiring ──────────────────────────────
         These reference the CSS custom properties set in globals.css,
         which in turn reference --bc-* tokens from the Style Dictionary
         build. This keeps a single source of truth in the token system.
         ────────────────────────────────────────────────────────────────── */
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        /* ── Raw bc-* colour tokens ────────────────────────────────────── */
        bc: {
          white: "var(--bc-color-white)",
          "dark-blue": "var(--bc-color-dark-blue)",
          blue: "var(--bc-color-blue)",
          "light-blue": "var(--bc-color-light-blue)",
          teal: "var(--bc-color-teal)",
          "light-teal": "var(--bc-color-light-teal)",
          green: "var(--bc-color-green)",
          tangerine: "var(--bc-color-tangerine)",
          yellow: "var(--bc-color-yellow)",
          "light-grey": "var(--bc-color-light-grey)",
          steel: "var(--bc-color-steel)",
          "dark-blue-dim": "var(--bc-color-dark-blue-dim)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "bc-none": "var(--bc-border-radius-none)",
        "bc-sm": "var(--bc-border-radius-sm)",
        "bc-md": "var(--bc-border-radius-md)",
        "bc-circle": "var(--bc-border-radius-circle)",
        "bc-pill": "var(--bc-border-radius-pill)",
      },
      spacing: {
        "bc-xs": "var(--bc-spacing-xs)",
        "bc-sm": "var(--bc-spacing-sm)",
        "bc-md": "var(--bc-spacing-md)",
        "bc-lg": "var(--bc-spacing-lg)",
        "bc-xl": "var(--bc-spacing-xl)",
        "bc-2xl": "var(--bc-spacing-2xl)",
        "bc-3xl": "var(--bc-spacing-3xl)",
      },
      maxWidth: {
        "bc-container": "var(--bc-container-max-width)",
        "bc-content": "var(--bc-container-content-width)",
        "bc-reading": "var(--bc-container-reading-width)",
      },
      fontFamily: {
        sans: ["var(--bc-font-family-sans)"],
        mono: ["var(--bc-font-family-mono)"],
      },
      fontWeight: {
        light: "var(--bc-font-weight-light)",
        medium: "var(--bc-font-weight-medium)",
        bold: "var(--bc-font-weight-bold)",
      },
      boxShadow: {
        "bc-sm": "var(--bc-shadow-sm)",
        "bc-md": "var(--bc-shadow-md)",
        "bc-lg": "var(--bc-shadow-lg)",
      },
      transitionDuration: {
        "bc-fast": "200ms",
        "bc-medium": "300ms",
        "bc-slow": "450ms",
      },
    },
  },
  plugins: [],
};

export default config;
