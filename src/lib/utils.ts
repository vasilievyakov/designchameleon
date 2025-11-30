import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Extract hex from string (handles "#hex - description" format)
  const hexMatch = hex.match(/#?([a-f\d]{6}|[a-f\d]{3})\b/i);
  if (!hexMatch) return { h: 0, s: 0, l: 0 };
  
  let hexClean = hexMatch[1];
  // Expand shorthand
  if (hexClean.length === 3) {
    hexClean = hexClean[0] + hexClean[0] + hexClean[1] + hexClean[1] + hexClean[2] + hexClean[2];
  }

  const r = parseInt(hexClean.slice(0, 2), 16) / 255;
  const g = parseInt(hexClean.slice(2, 4), 16) / 255;
  const b = parseInt(hexClean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getContrastColor(hex: string): string {
  // Extract hex from string (handles "#hex - description" format)
  const hexMatch = hex.match(/#?([a-f\d]{6}|[a-f\d]{3})\b/i);
  if (!hexMatch) return "#ffffff";
  
  let hexClean = hexMatch[1];
  // Expand shorthand
  if (hexClean.length === 3) {
    hexClean = hexClean[0] + hexClean[0] + hexClean[1] + hexClean[1] + hexClean[2] + hexClean[2];
  }

  const r = parseInt(hexClean.slice(0, 2), 16);
  const g = parseInt(hexClean.slice(2, 4), 16);
  const b = parseInt(hexClean.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

