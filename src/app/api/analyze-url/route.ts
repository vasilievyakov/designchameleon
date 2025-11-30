import { NextRequest, NextResponse } from "next/server";
import type { DesignSystem, ColorPalette } from "@/types/design-system";

// Gemini API for intelligent color mapping
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function getBrowser() {
  const puppeteer = await import("puppeteer-core");
  
  // Check if running in Vercel/serverless
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
    const chromium = await import("@sparticuz/chromium").then(m => m.default);
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  
  // Local development - try common Chrome paths
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ];
  
  let executablePath = "";
  const fs = await import("fs");
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }
  
  if (!executablePath) {
    throw new Error("Chrome not found. Please install Chrome or set CHROME_PATH environment variable.");
  }
  
  return puppeteer.launch({
    executablePath: process.env.CHROME_PATH || executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

// ============================================================================
// AI-POWERED COLOR MAPPING
// ============================================================================

interface ColorMapping {
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

async function analyzeColorsWithAI(
  cssVariables: Record<string, string>,
  computedColors: { color: string; count: number }[],
  siteName: string
): Promise<ColorMapping | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Prepare color data for AI
  const colorVarsText = Object.entries(cssVariables)
    .filter(([_, value]) => {
      const v = value.trim();
      return v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl') || 
             v.match(/^\d+\s+[\d.]+%?\s+[\d.]+%?$/) ||
             ['white', 'black', 'red', 'blue', 'green', 'yellow'].includes(v.toLowerCase());
    })
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const topColors = computedColors
    .slice(0, 20)
    .map(c => `${c.color} (used ${c.count} times)`)
    .join('\n');

  const prompt = `You are a design system expert. Analyze these CSS variables and computed colors from "${siteName}" and map them to design system roles.

CSS Variables:
${colorVarsText || 'None'}

Computed colors (by frequency):
${topColors || 'None'}

Return ONLY a JSON object with hex color values. NO descriptions, NO comments, ONLY hex codes like "#0058a3".

{
  "primary": "#hexcode",
  "secondary": "#hexcode",
  "accent": "#hexcode",
  "background": "#hexcode",
  "foreground": "#hexcode",
  "muted": "#hexcode",
  "mutedForeground": "#hexcode",
  "card": "#hexcode",
  "cardForeground": "#hexcode",
  "border": "#hexcode",
  "success": "#hexcode",
  "error": "#hexcode",
  "warning": "#hexcode",
  "info": "#hexcode"
}

Rules:
1. Use EXACT hex values from CSS variables - copy them directly
2. primary = main brand color (usually the most prominent saturated color)
3. secondary = second brand color or accent
4. accent = highlight color for CTAs
5. background/foreground = determine light vs dark theme first
6. Return ONLY hex values, no text descriptions`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) return null;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Extract hex from value (AI might return "#hex - description")
    const extractHex = (value: string): string | null => {
      if (!value) return null;
      // Match hex at the start of string
      const hexMatch = value.match(/#[0-9a-fA-F]{3,6}/);
      return hexMatch ? hexMatch[0].toLowerCase() : null;
    };

    // Normalize all colors - extract hex first, then normalize
    const result: ColorMapping = {
      primary: extractHex(parsed.primary) || normalizeColor(parsed.primary) || '#6366f1',
      secondary: extractHex(parsed.secondary) || normalizeColor(parsed.secondary) || '#a855f7',
      accent: extractHex(parsed.accent) || normalizeColor(parsed.accent) || '#10b981',
      background: extractHex(parsed.background) || normalizeColor(parsed.background) || '#ffffff',
      foreground: extractHex(parsed.foreground) || normalizeColor(parsed.foreground) || '#0a0a0a',
      muted: extractHex(parsed.muted) || normalizeColor(parsed.muted) || '#f4f4f5',
      mutedForeground: extractHex(parsed.mutedForeground) || normalizeColor(parsed.mutedForeground) || '#71717a',
      card: extractHex(parsed.card) || normalizeColor(parsed.card) || '#ffffff',
      cardForeground: extractHex(parsed.cardForeground) || normalizeColor(parsed.cardForeground) || '#0a0a0a',
      border: extractHex(parsed.border) || normalizeColor(parsed.border) || '#e4e4e7',
      success: extractHex(parsed.success) || normalizeColor(parsed.success) || '#22c55e',
      error: extractHex(parsed.error) || normalizeColor(parsed.error) || '#ef4444',
      warning: extractHex(parsed.warning) || normalizeColor(parsed.warning) || '#f59e0b',
      info: extractHex(parsed.info) || normalizeColor(parsed.info) || '#3b82f6',
    };

    return result;
  } catch (error) {
    console.error("AI color analysis failed:", error);
    return null;
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

function normalizeColor(value: string | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  
  // Try to extract hex from anywhere in the string (handles "#hex - description" format)
  const hexMatch = v.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  if (hexMatch) {
    const hex = hexMatch[0].toLowerCase();
    // Expand shorthand
    if (hex.length === 4) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  }
  
  // HSL format (shadcn style: "240 10% 3.9%")
  if (v.match(/^\d+\s+[\d.]+%?\s+[\d.]+%?$/)) {
    const parts = v.split(/\s+/);
    const h = parts[0];
    const s = parts[1].includes('%') ? parts[1] : parts[1] + '%';
    const l = parts[2].includes('%') ? parts[2] : parts[2] + '%';
    return `hsl(${h}, ${s}, ${l})`;
  }
  
  // rgb/rgba/hsl/hsla
  if (v.startsWith('rgb') || v.startsWith('hsl')) {
    return v;
  }
  
  // CSS color names
  const namedColors: Record<string, string> = {
    'white': '#ffffff', 'black': '#000000', 'red': '#ff0000',
    'green': '#00ff00', 'blue': '#0000ff', 'yellow': '#ffff00',
  };
  if (namedColors[v.toLowerCase()]) {
    return namedColors[v.toLowerCase()];
  }
  
  return null;
}

function isLight(hex: string): boolean {
  if (!hex.startsWith('#')) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r + g + b) / 3 > 180;
}

function isDark(hex: string): boolean {
  if (!hex.startsWith('#')) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r + g + b) / 3 < 75;
}

// ============================================================================
// FALLBACK HEURISTIC MAPPING (when AI is not available)
// ============================================================================

function fallbackColorMapping(
  cssVariables: Record<string, string>,
  computedColors: { color: string; count: number }[]
): ColorMapping {
  const colorVars: Array<{key: string; value: string; color: string}> = [];
  
  for (const [key, value] of Object.entries(cssVariables)) {
    const color = normalizeColor(value);
    if (color && color !== 'transparent') {
      colorVars.push({ key: key.toLowerCase(), value, color });
    }
  }

  const sortedComputed = [...computedColors].sort((a, b) => b.count - a.count);

  // Helper to find by keywords
  const findByKeywords = (keywords: string[], exclude: string[] = []): string | null => {
    for (const kw of keywords) {
      const found = colorVars.find(v => 
        v.key.includes(kw) && !exclude.some(ex => v.key.includes(ex))
      );
      if (found) return found.color;
    }
    return null;
  };

  // Helper to find saturated color
  const findSaturatedColor = (exclude: string[] = []): string | null => {
    return sortedComputed.find(c => {
      if (exclude.includes(c.color)) return false;
      if (!c.color.startsWith('#')) return false;
      const r = parseInt(c.color.slice(1, 3), 16);
      const g = parseInt(c.color.slice(3, 5), 16);
      const b = parseInt(c.color.slice(5, 7), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      return sat > 0.4 && !isLight(c.color) && !isDark(c.color);
    })?.color || null;
  };

  // Determine theme (light or dark)
  const bgCandidate = findByKeywords(['background', 'bg-', '-bg'], ['hover', 'text', 'foreground']);
  const isLightTheme = bgCandidate ? isLight(bgCandidate) : true;

  // Find colors
  const primary = findByKeywords(['primary', 'brand', 'main', 'blue', 'accent'], ['hover', 'light', 'dark', 'foreground', 'text']) ||
                  findSaturatedColor() ||
                  '#6366f1';
  
  const secondary = findByKeywords(['secondary', 'purple', 'violet'], ['hover', 'light', 'foreground']) ||
                    findSaturatedColor([primary]) ||
                    '#a855f7';
  
  const accent = findByKeywords(['accent', 'highlight', 'yellow', 'orange', 'cta'], ['hover', 'light']) ||
                 findSaturatedColor([primary, secondary]) ||
                 '#10b981';

  const background = bgCandidate || 
                     (isLightTheme ? '#ffffff' : '#0a0a0a');
  
  const foreground = findByKeywords(['foreground', 'text-dark', 'text-black', 'text-primary'], ['muted', 'light']) ||
                     sortedComputed.find(c => isDark(c.color))?.color ||
                     (isLightTheme ? '#0a0a0a' : '#fafafa');

  const muted = findByKeywords(['muted', 'gray', 'grey', 'neutral', 'subtle'], ['foreground', 'text', 'dark']) ||
                (isLightTheme ? '#f4f4f5' : '#27272a');

  const mutedFg = findByKeywords(['muted-foreground', 'text-muted', 'text-secondary'], ['bg']) ||
                  (isLightTheme ? '#71717a' : '#a1a1aa');

  const border = findByKeywords(['border', 'divider', 'separator', 'line'], ['radius', 'width']) ||
                 (isLightTheme ? '#e4e4e7' : '#3f3f46');

  const success = findByKeywords(['success', 'green', 'positive', 'valid'], ['hover', 'light']) || '#22c55e';
  const error = findByKeywords(['error', 'danger', 'destructive', 'red', 'invalid'], ['hover', 'light']) || '#ef4444';
  const warning = findByKeywords(['warning', 'yellow', 'caution', 'orange', 'amber'], ['hover', 'light']) || '#f59e0b';
  const info = findByKeywords(['info', 'blue', 'notice', 'link'], ['hover', 'light', 'primary']) || '#3b82f6';

  return {
    primary,
    secondary,
    accent,
    background,
    foreground,
    muted,
    mutedForeground: mutedFg,
    card: findByKeywords(['card', 'surface'], ['foreground']) || background,
    cardForeground: findByKeywords(['card-foreground']) || foreground,
    border,
    success,
    error,
    warning,
    info,
  };
}

// ============================================================================
// CONVERT TO DESIGN SYSTEM
// ============================================================================

async function convertToDesignSystem(
  data: ExtractedStyles, 
  url: string,
  useAI: boolean = true
): Promise<DesignSystem> {
  const { 
    cssVariables = {}, 
    colors = [], 
    fonts = [], 
    borderRadii = [], 
    shadows = [], 
    spacings = [], 
    meta = { title: '', description: '', themeColor: '' } 
  } = data || {};

  const urlObj = new URL(url);
  const siteName = urlObj.hostname.replace('www.', '');
  const capitalizedName = siteName.split('.')[0].charAt(0).toUpperCase() + siteName.split('.')[0].slice(1);

  // Get color mapping - try AI first, fallback to heuristics
  let colorMapping: ColorMapping;
  
  if (useAI) {
    const aiMapping = await analyzeColorsWithAI(cssVariables, colors, siteName);
    colorMapping = aiMapping || fallbackColorMapping(cssVariables, colors);
    console.log('Color mapping source:', aiMapping ? 'AI' : 'fallback');
  } else {
    colorMapping = fallbackColorMapping(cssVariables, colors);
  }

  // ============================================================================
  // EXTRACT FONTS
  // ============================================================================

  const fontVarValue = cssVariables['--font'] || cssVariables['--font-family'] || 
    Object.entries(cssVariables).find(([k]) => k.includes('font') && !k.includes('size') && !k.includes('weight'))?.[1];
  
  let extractedFont = '';
  if (fontVarValue) {
    const fontMatch = fontVarValue.match(/["']?([^"',]+)["']?/);
    if (fontMatch) extractedFont = fontMatch[1].trim();
  }

  const safeFonts = fonts || [];
  const mainFont = extractedFont || safeFonts[0]?.family || 'Inter';
  
  const headingFont = safeFonts.find(f => f.weights?.some(w => parseInt(w) >= 600))?.family || mainFont;
  const bodyFont = safeFonts.find(f => f.weights?.some(w => parseInt(w) >= 400 && parseInt(w) < 600))?.family || mainFont;
  const monoFont = safeFonts.find(f => 
    f.family?.toLowerCase().includes('mono') || 
    f.family?.toLowerCase().includes('code')
  )?.family || 'JetBrains Mono';

  // Extract font sizes
  const allFontSizes: number[] = [];
  for (const [key, value] of Object.entries(cssVariables)) {
    if (key.includes('font-size') || key.includes('text-')) {
      const match = value.match(/([\d.]+)/);
      if (match) {
        let size = parseFloat(match[1]);
        if (value.includes('rem')) size *= 16;
        if (size > 8 && size < 100) allFontSizes.push(size);
      }
    }
  }
  
  for (const font of safeFonts) {
    for (const size of font.sizes || []) {
      const match = size.match(/([\d.]+)/);
      if (match) {
        let s = parseFloat(match[1]);
        if (size.includes('rem')) s *= 16;
        if (s > 8 && s < 100) allFontSizes.push(s);
      }
    }
  }
  
  const sortedSizes = [...new Set(allFontSizes)].sort((a, b) => b - a);

  // ============================================================================
  // EXTRACT BORDER RADIUS
  // ============================================================================

  const radiusVar = cssVariables['--radius'] || cssVariables['--border-radius'] ||
    Object.entries(cssVariables).find(([k]) => k.includes('radius') && !k.includes('full'))?.[1];
  
  let baseRadius = 8;
  if (radiusVar) {
    const match = radiusVar.match(/([\d.]+)/);
    if (match) {
      let value = parseFloat(match[1]);
      if (radiusVar.includes('rem')) value *= 16;
      baseRadius = value;
    }
  } else {
    const safeRadii = borderRadii || [];
    const radiusValues = safeRadii
      .map(r => { const m = r.match(/([\d.]+)/); return m ? parseFloat(m[1]) : NaN; })
      .filter(r => !isNaN(r) && r > 0)
      .sort((a, b) => a - b);
    if (radiusValues.length > 0) {
      baseRadius = radiusValues[Math.floor(radiusValues.length / 2)];
    }
  }

  // ============================================================================
  // EXTRACT SHADOWS
  // ============================================================================

  const validShadows = (shadows || [])
    .filter(s => s && s !== 'none')
    .sort((a, b) => a.length - b.length);

  // ============================================================================
  // EXTRACT SPACING
  // ============================================================================

  const spacingVars: number[] = [];
  for (const [key, value] of Object.entries(cssVariables)) {
    if (key.includes('spacing') || key.includes('gap')) {
      const match = value.match(/([\d.]+)/);
      if (match) {
        let v = parseFloat(match[1]);
        if (value.includes('rem')) v *= 16;
        if (v > 0 && v < 200) spacingVars.push(v);
      }
    }
  }

  const spacingValues = (spacings || [])
    .flatMap(s => s?.split(' ') || [])
    .map(s => {
      const match = s.match(/([\d.]+)/);
      if (!match) return NaN;
      let v = parseFloat(match[1]);
      if (s.includes('rem')) v *= 16;
      return v;
    })
    .concat(spacingVars)
    .filter(s => !isNaN(s) && s > 0 && s < 200)
    .sort((a, b) => a - b);

  const uniqueSpacings = [...new Set(spacingValues.map(v => Math.round(v)))];

  // ============================================================================
  // GENERATE MOOD
  // ============================================================================

  const mood: string[] = [];
  
  if (isDark(colorMapping.background)) {
    mood.push('Dark Mode');
  } else {
    mood.push('Light Mode');
  }

  if (baseRadius >= 12) mood.push('Rounded');
  else if (baseRadius <= 4) mood.push('Sharp');
  else mood.push('Modern');

  if (validShadows.length > 3) mood.push('Elevated');
  else if (validShadows.length === 0) mood.push('Flat');

  mood.push('Professional');

  // ============================================================================
  // BUILD RESULT
  // ============================================================================

  return {
    name: `${capitalizedName} Design System`,
    description: meta.description || `Design system extracted from ${siteName}`,
    colors: colorMapping as ColorPalette,
    gradients: [],
    typography: {
      headingFont,
      bodyFont,
      monoFont,
      headingWeight: '700',
      bodyWeight: '400',
      headingSizes: {
        h1: sortedSizes[0] ? `${sortedSizes[0]}px` : '3rem',
        h2: sortedSizes[1] ? `${sortedSizes[1]}px` : '2.25rem',
        h3: sortedSizes[2] ? `${sortedSizes[2]}px` : '1.5rem',
        h4: sortedSizes[3] ? `${sortedSizes[3]}px` : '1.25rem',
      },
      bodySizes: {
        large: sortedSizes.find(s => s >= 16 && s <= 20) ? `${sortedSizes.find(s => s >= 16 && s <= 20)}px` : '1.125rem',
        base: sortedSizes.find(s => s >= 14 && s <= 16) ? `${sortedSizes.find(s => s >= 14 && s <= 16)}px` : '1rem',
        small: sortedSizes.find(s => s >= 12 && s <= 14) ? `${sortedSizes.find(s => s >= 12 && s <= 14)}px` : '0.875rem',
      },
      lineHeight: { heading: '1.2', body: '1.6' },
    },
    styles: {
      borderRadius: {
        none: '0',
        sm: `${Math.max(2, Math.round(baseRadius * 0.5))}px`,
        md: `${Math.round(baseRadius)}px`,
        lg: `${Math.round(baseRadius * 1.5)}px`,
        xl: `${Math.round(baseRadius * 2)}px`,
        full: '9999px',
      },
      shadows: {
        sm: validShadows[0] || '0 1px 2px rgba(0,0,0,0.05)',
        md: validShadows[1] || validShadows[0] || '0 4px 6px -1px rgba(0,0,0,0.1)',
        lg: validShadows[2] || validShadows[1] || '0 10px 15px -3px rgba(0,0,0,0.1)',
        xl: validShadows[3] || validShadows[2] || '0 20px 25px -5px rgba(0,0,0,0.1)',
      },
      spacing: {
        xs: `${uniqueSpacings[0] || 4}px`,
        sm: `${uniqueSpacings[Math.floor(uniqueSpacings.length * 0.2)] || 8}px`,
        md: `${uniqueSpacings[Math.floor(uniqueSpacings.length * 0.4)] || 16}px`,
        lg: `${uniqueSpacings[Math.floor(uniqueSpacings.length * 0.6)] || 24}px`,
        xl: `${uniqueSpacings[Math.floor(uniqueSpacings.length * 0.8)] || 32}px`,
        '2xl': `${uniqueSpacings[uniqueSpacings.length - 1] || 48}px`,
      },
    },
    mood: mood.slice(0, 5),
    suggestedUse: [`Based on ${siteName}`, meta.title || ''].filter(Boolean),
  };
}

// ============================================================================
// TYPES
// ============================================================================

interface ExtractedStyles {
  cssVariables: Record<string, string>;
  colors: { color: string; count: number }[];
  fonts: { family: string; weights: string[]; sizes: string[] }[];
  borderRadii: string[];
  shadows: string[];
  spacings: string[];
  meta: { title: string; description: string; themeColor: string };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL. Please provide a valid http/https URL." }, { status: 400 });
    }

    // Launch browser
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract styles
    const extractedData = await page.evaluate(() => {
      const rgbToHex = (rgb: string): string | null => {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb.startsWith('#') ? rgb : null;
        const [, r, g, b] = match;
        return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
      };

      // Extract CSS Variables
      const cssVariables: Record<string, string> = {};
      try {
        for (const sheet of document.styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (let i = 0; i < rules.length; i++) {
              const rule = rules[i] as CSSStyleRule;
              if (rule.selectorText === ':root' || rule.selectorText === 'html') {
                const style = rule.style;
                for (let j = 0; j < style.length; j++) {
                  const prop = style[j];
                  if (prop.startsWith('--')) {
                    cssVariables[prop] = style.getPropertyValue(prop).trim();
                  }
                }
              }
            }
          } catch {}
        }
      } catch {}

      // Collect from elements
      const colorsMap = new Map<string, number>();
      const fontsMap = new Map<string, { weight: Set<string>; size: Set<string> }>();
      const borderRadiiSet = new Set<string>();
      const shadowsSet = new Set<string>();
      const spacingsSet = new Set<string>();

      const selectors = [
        'body', 'main', 'header', 'footer', 'nav', 'section', 'article',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'button', 'input',
        '.btn', '.button', '.card', 'div', 'li'
      ];

      const elements: Element[] = [];
      for (const sel of selectors) {
        try {
          const found = document.querySelectorAll(sel);
          for (let i = 0; i < Math.min(found.length, 50); i++) elements.push(found[i]);
        } catch {}
      }
      
      const uniqueElements = [...new Set(elements)].slice(0, 300);

      for (const el of uniqueElements) {
        try {
          const style = getComputedStyle(el);
          
          for (const prop of ['color', 'backgroundColor', 'borderColor']) {
            const hex = rgbToHex(style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase()));
            if (hex) colorsMap.set(hex, (colorsMap.get(hex) || 0) + 1);
          }

          const fontFamily = style.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
          if (fontFamily && fontFamily !== 'inherit' && fontFamily.length < 50) {
            const fontInfo = fontsMap.get(fontFamily) || { weight: new Set<string>(), size: new Set<string>() };
            fontInfo.weight.add(style.fontWeight);
            fontInfo.size.add(style.fontSize);
            fontsMap.set(fontFamily, fontInfo);
          }

          const br = style.borderRadius;
          if (br && br !== '0px' && br !== '0') borderRadiiSet.add(br);

          const shadow = style.boxShadow;
          if (shadow && shadow !== 'none') shadowsSet.add(shadow);

          const padding = style.padding;
          if (padding && padding !== '0px' && !padding.includes('auto')) spacingsSet.add(padding);
        } catch {}
      }

      const sortedColors = [...colorsMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([color, count]) => ({ color, count }));

      const processedFonts = [...fontsMap.entries()]
        .map(([family, info]) => ({
          family,
          weights: [...info.weight],
          sizes: [...info.size],
        }));

      const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

      return {
        cssVariables,
        colors: sortedColors.slice(0, 50),
        fonts: processedFonts,
        borderRadii: [...borderRadiiSet].slice(0, 10),
        shadows: [...shadowsSet].slice(0, 10),
        spacings: [...spacingsSet].slice(0, 20),
        meta: {
          title: document.title || '',
          description: descMeta?.content || '',
          themeColor: themeMeta?.content || '',
        }
      };
    }) as ExtractedStyles;
    
    console.log('Extracted CSS variables:', Object.keys(extractedData.cssVariables).length);
    console.log('Extracted colors:', extractedData.colors.length);

    // Screenshot
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80, encoding: 'base64' });

    await browser.close();
    browser = null;

    // Convert with AI analysis
    const designSystem = await convertToDesignSystem(extractedData, url, true);

    return NextResponse.json({ 
      designSystem,
      screenshot: `data:image/jpeg;base64,${screenshot}`,
      extractedData,
      source: 'url'
    });

  } catch (error) {
    console.error("URL analysis error:", error);
    if (browser) try { await browser.close(); } catch {}
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze URL" },
      { status: 500 }
    );
  }
}

