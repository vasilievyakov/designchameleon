export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface Gradient {
  from: string;
  to: string;
  via?: string;
  direction: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingWeight: string;
  bodyWeight: string;
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  bodySizes: {
    large: string;
    base: string;
    small: string;
  };
  lineHeight: {
    heading: string;
    body: string;
  };
}

export interface Styles {
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
}

export interface DesignSystem {
  name: string;
  description: string;
  colors: ColorPalette;
  gradients: Gradient[];
  typography: Typography;
  styles: Styles;
  mood: string[];
  suggestedUse: string[];
}

export type PreviewMode = "dashboard" | "landing" | "cards" | "ecommerce" | "mobile";

export type OutputFormat = "css" | "tailwind" | "shadcn" | "json" | "figma";

