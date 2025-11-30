import type { DesignSystem } from "@/types/design-system";

export const demoDesignSystem: DesignSystem = {
  name: "Nebula Dark",
  description: "A sophisticated dark theme with vibrant purple and emerald accents, perfect for modern SaaS applications.",
  colors: {
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#10b981",
    background: "#0f0f12",
    foreground: "#f4f4f5",
    muted: "#1c1c24",
    mutedForeground: "#71717a",
    card: "#18181f",
    cardForeground: "#f4f4f5",
    border: "#27272a",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
  gradients: [
    {
      from: "#8b5cf6",
      to: "#ec4899",
      direction: "to right",
    },
    {
      from: "#10b981",
      to: "#3b82f6",
      direction: "135deg",
    },
    {
      from: "#8b5cf6",
      via: "#ec4899",
      to: "#f59e0b",
      direction: "to bottom right",
    },
  ],
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    headingWeight: "700",
    bodyWeight: "400",
    headingSizes: {
      h1: "3rem",
      h2: "2.25rem",
      h3: "1.5rem",
      h4: "1.25rem",
    },
    bodySizes: {
      large: "1.125rem",
      base: "1rem",
      small: "0.875rem",
    },
    lineHeight: {
      heading: "1.2",
      body: "1.6",
    },
  },
  styles: {
    borderRadius: {
      none: "0",
      sm: "0.375rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      "2xl": "3rem",
    },
  },
  mood: ["Modern", "Professional", "Dark", "Vibrant", "Tech-forward"],
  suggestedUse: ["SaaS Dashboard", "Developer Tools", "Analytics Platform"],
};

