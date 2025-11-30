/**
 * Advanced Image Analyzer
 * Deep analysis of design images using Canvas API
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  count: number;
}

export interface ColorAnalysis {
  dominantColors: ColorInfo[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  proportions: {
    primary: number;
    secondary: number;
    accent: number;
  };
  temperature: "warm" | "cool" | "neutral";
  temperatureScore: number; // -100 (cool) to +100 (warm)
  saturation: "vibrant" | "moderate" | "muted" | "desaturated";
  saturationScore: number; // 0-100
  contrast: "high" | "medium" | "low";
  contrastRatio: number;
  paletteType: "monochromatic" | "complementary" | "analogous" | "triadic" | "split-complementary" | "mixed";
  lightnessDistribution: {
    dark: number; // percentage of dark pixels
    mid: number;
    light: number;
  };
}

export interface SpatialAnalysis {
  density: "dense" | "balanced" | "spacious";
  densityScore: number; // 0-100 (0 = very spacious, 100 = very dense)
  whitespacePercentage: number;
  visualWeight: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    center: number;
  };
  balance: "symmetric" | "asymmetric-left" | "asymmetric-right" | "asymmetric-top" | "asymmetric-bottom" | "centered";
  gridDetection: {
    possibleColumns: number;
    confidence: number;
  };
  focalPoints: Array<{ x: number; y: number; intensity: number }>;
}

export interface GeometryAnalysis {
  cornerStyle: "sharp" | "soft" | "rounded" | "pill" | "mixed";
  estimatedRadius: {
    min: number;
    max: number;
    average: number;
  };
  edgeDensity: number; // 0-100, how many edges detected
  linearity: number; // 0-100, straight lines vs curves
  shapes: {
    rectangles: number;
    circles: number;
    organic: number;
  };
}

export interface EffectsAnalysis {
  hasGlassmorphism: boolean;
  glassmorphismScore: number;
  gradients: {
    detected: boolean;
    count: number;
    directions: string[];
    types: ("linear" | "radial")[];
  };
  shadows: {
    intensity: "none" | "subtle" | "medium" | "dramatic";
    score: number;
    direction: string;
  };
  depth: "flat" | "subtle" | "material" | "neumorphic";
  depthScore: number;
  hasNoise: boolean;
  noiseLevel: number;
}

export interface StyleAnalysis {
  minimalism: number; // 0-100
  complexity: number; // 0-100
  modernness: number; // 0-100
  elegance: number; // 0-100
  boldness: number; // 0-100
  industry: "tech" | "finance" | "creative" | "healthcare" | "ecommerce" | "media" | "general";
  industryConfidence: number;
  aestheticTags: string[];
  era: "classic" | "modern" | "futuristic";
}

export interface ImageAnalysisResult {
  colors: ColorAnalysis;
  spatial: SpatialAnalysis;
  geometry: GeometryAnalysis;
  effects: EffectsAnalysis;
  style: StyleAnalysis;
  metadata: {
    width: number;
    height: number;
    aspectRatio: number;
    analyzedAt: string;
    processingTime: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

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

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
  );
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

// ============================================================================
// COLOR ANALYSIS
// ============================================================================

function analyzeColors(imageData: ImageData): ColorAnalysis {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Color quantization using median cut algorithm (simplified)
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
  const step = 4; // Sample every 4th pixel for performance

  let totalHue = 0;
  let totalSaturation = 0;
  let totalLightness = 0;
  let hueCount = 0;

  const lightnessDistribution = { dark: 0, mid: 0, light: 0 };

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue; // Skip transparent pixels

    // Quantize to reduce color space
    const qr = Math.round(r / 16) * 16;
    const qg = Math.round(g / 16) * 16;
    const qb = Math.round(b / 16) * 16;
    const key = `${qr},${qg},${qb}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { r: qr, g: qg, b: qb, count: 1 });
    }

    const hsl = rgbToHsl(r, g, b);
    if (hsl.s > 10) {
      totalHue += hsl.h;
      hueCount++;
    }
    totalSaturation += hsl.s;
    totalLightness += hsl.l;

    // Lightness distribution
    if (hsl.l < 30) lightnessDistribution.dark++;
    else if (hsl.l > 70) lightnessDistribution.light++;
    else lightnessDistribution.mid++;
  }

  const sampledPixels = Math.floor(totalPixels / step);

  // Sort colors by frequency
  const sortedColors = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Convert to ColorInfo
  const dominantColors: ColorInfo[] = sortedColors.map((c) => {
    const hex = rgbToHex(c.r, c.g, c.b);
    const hsl = rgbToHsl(c.r, c.g, c.b);
    return {
      hex,
      rgb: { r: c.r, g: c.g, b: c.b },
      hsl,
      percentage: (c.count / sampledPixels) * 100,
      count: c.count,
    };
  });

  // Determine palette
  const palette = extractPalette(dominantColors);

  // Calculate proportions (60-30-10 approximation)
  const top3 = dominantColors.slice(0, 3);
  const totalTop3 = top3.reduce((sum, c) => sum + c.percentage, 0);
  const proportions = {
    primary: top3[0] ? (top3[0].percentage / totalTop3) * 100 : 60,
    secondary: top3[1] ? (top3[1].percentage / totalTop3) * 100 : 30,
    accent: top3[2] ? (top3[2].percentage / totalTop3) * 100 : 10,
  };

  // Temperature analysis
  const avgHue = hueCount > 0 ? totalHue / hueCount : 0;
  let temperatureScore = 0;
  // Warm: 0-60, 300-360; Cool: 180-240
  if ((avgHue >= 0 && avgHue <= 60) || avgHue >= 300) {
    temperatureScore = 50 + (avgHue <= 60 ? avgHue : 360 - avgHue) * 0.8;
  } else if (avgHue >= 180 && avgHue <= 240) {
    temperatureScore = -50 - (30 - Math.abs(avgHue - 210)) * 1.5;
  } else {
    temperatureScore = (avgHue - 150) * 0.5;
  }
  temperatureScore = Math.max(-100, Math.min(100, temperatureScore));

  const temperature: "warm" | "cool" | "neutral" =
    temperatureScore > 25 ? "warm" : temperatureScore < -25 ? "cool" : "neutral";

  // Saturation analysis
  const avgSaturation = totalSaturation / sampledPixels;
  const saturationScore = avgSaturation;
  const saturation: "vibrant" | "moderate" | "muted" | "desaturated" =
    avgSaturation > 60 ? "vibrant" :
    avgSaturation > 40 ? "moderate" :
    avgSaturation > 20 ? "muted" : "desaturated";

  // Contrast analysis
  const luminances = dominantColors.slice(0, 5).map((c) =>
    getRelativeLuminance(c.rgb.r, c.rgb.g, c.rgb.b)
  );
  const maxLum = Math.max(...luminances);
  const minLum = Math.min(...luminances);
  const contrastRatio = (maxLum + 0.05) / (minLum + 0.05);

  const contrast: "high" | "medium" | "low" =
    contrastRatio > 7 ? "high" : contrastRatio > 3 ? "medium" : "low";

  // Palette type detection
  const paletteType = detectPaletteType(dominantColors);

  // Normalize lightness distribution
  const totalLightDist = lightnessDistribution.dark + lightnessDistribution.mid + lightnessDistribution.light;

  return {
    dominantColors,
    palette,
    proportions,
    temperature,
    temperatureScore,
    saturation,
    saturationScore,
    contrast,
    contrastRatio,
    paletteType,
    lightnessDistribution: {
      dark: (lightnessDistribution.dark / totalLightDist) * 100,
      mid: (lightnessDistribution.mid / totalLightDist) * 100,
      light: (lightnessDistribution.light / totalLightDist) * 100,
    },
  };
}

function extractPalette(colors: ColorInfo[]): ColorAnalysis["palette"] {
  // Find background (usually largest area, light or dark)
  const bgCandidates = colors.filter((c) => c.hsl.s < 20 || c.percentage > 30);
  const background = bgCandidates[0]?.hex || colors[0]?.hex || "#ffffff";

  // Find foreground (contrasting with background)
  const bgLightness = colors.find((c) => c.hex === background)?.hsl.l || 50;
  const foregroundCandidates = colors.filter((c) =>
    Math.abs(c.hsl.l - bgLightness) > 40
  );
  const foreground = foregroundCandidates[0]?.hex || (bgLightness > 50 ? "#000000" : "#ffffff");

  // Find primary (most saturated prominent color)
  const primaryCandidates = colors
    .filter((c) => c.hsl.s > 30 && c.percentage > 2)
    .sort((a, b) => b.hsl.s * b.percentage - a.hsl.s * a.percentage);
  const primary = primaryCandidates[0]?.hex || "#6366f1";

  // Find secondary (different hue from primary)
  const primaryHue = primaryCandidates[0]?.hsl.h || 0;
  const secondaryCandidates = colors.filter(
    (c) => c.hsl.s > 20 && hueDistance(c.hsl.h, primaryHue) > 30 && c.hex !== primary
  );
  const secondary = secondaryCandidates[0]?.hex || "#a855f7";

  // Find accent (vibrant, different from both)
  const accentCandidates = colors.filter(
    (c) =>
      c.hsl.s > 40 &&
      c.hex !== primary &&
      c.hex !== secondary &&
      hueDistance(c.hsl.h, primaryHue) > 60
  );
  const accent = accentCandidates[0]?.hex || "#10b981";

  return { primary, secondary, accent, background, foreground };
}

function detectPaletteType(colors: ColorInfo[]): ColorAnalysis["paletteType"] {
  const saturatedColors = colors.filter((c) => c.hsl.s > 20).slice(0, 5);
  if (saturatedColors.length < 2) return "monochromatic";

  const hues = saturatedColors.map((c) => c.hsl.h);
  const hueDistances: number[] = [];

  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      hueDistances.push(hueDistance(hues[i], hues[j]));
    }
  }

  const maxDistance = Math.max(...hueDistances);
  const avgDistance = hueDistances.reduce((a, b) => a + b, 0) / hueDistances.length;

  if (maxDistance < 30) return "monochromatic";
  if (avgDistance < 40) return "analogous";
  if (hueDistances.some((d) => d > 150 && d < 210)) return "complementary";
  if (hueDistances.filter((d) => d > 100 && d < 140).length >= 2) return "triadic";
  if (hueDistances.some((d) => d > 130 && d < 170)) return "split-complementary";

  return "mixed";
}

// ============================================================================
// SPATIAL ANALYSIS
// ============================================================================

function analyzeSpatial(imageData: ImageData): SpatialAnalysis {
  const { data, width, height } = imageData;

  // Divide image into regions
  const regions = {
    top: { weight: 0, pixels: 0 },
    bottom: { weight: 0, pixels: 0 },
    left: { weight: 0, pixels: 0 },
    right: { weight: 0, pixels: 0 },
    center: { weight: 0, pixels: 0 },
  };

  let whitespacePixels = 0;
  let contentPixels = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const centerRadius = Math.min(width, height) / 4;

  // Edge detection for density
  let edgePixels = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const hsl = rgbToHsl(r, g, b);

      // Visual weight (darker and more saturated = heavier)
      const weight = (255 - luminance) / 255 + hsl.s / 200;

      // Whitespace detection (light, low saturation)
      if (hsl.l > 90 && hsl.s < 10) {
        whitespacePixels++;
      } else {
        contentPixels++;
      }

      // Regional assignment
      const inCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) < centerRadius;

      if (inCenter) {
        regions.center.weight += weight;
        regions.center.pixels++;
      }
      if (y < height / 3) {
        regions.top.weight += weight;
        regions.top.pixels++;
      }
      if (y > (height * 2) / 3) {
        regions.bottom.weight += weight;
        regions.bottom.pixels++;
      }
      if (x < width / 3) {
        regions.left.weight += weight;
        regions.left.pixels++;
      }
      if (x > (width * 2) / 3) {
        regions.right.weight += weight;
        regions.right.pixels++;
      }

      // Simple edge detection (Sobel-like)
      if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        const neighbors = [
          (y - 1) * width + x,
          (y + 1) * width + x,
          y * width + (x - 1),
          y * width + (x + 1),
        ];

        for (const ni of neighbors) {
          const nl = 0.299 * data[ni * 4] + 0.587 * data[ni * 4 + 1] + 0.114 * data[ni * 4 + 2];
          if (Math.abs(luminance - nl) > 30) {
            edgePixels++;
            break;
          }
        }
      }
    }
  }

  const totalPixels = width * height;
  const whitespacePercentage = (whitespacePixels / totalPixels) * 100;

  // Density calculation
  const densityScore = 100 - whitespacePercentage;
  const density: "dense" | "balanced" | "spacious" =
    densityScore > 70 ? "dense" : densityScore > 40 ? "balanced" : "spacious";

  // Visual weight normalization
  const visualWeight = {
    top: regions.top.pixels > 0 ? regions.top.weight / regions.top.pixels : 0,
    bottom: regions.bottom.pixels > 0 ? regions.bottom.weight / regions.bottom.pixels : 0,
    left: regions.left.pixels > 0 ? regions.left.weight / regions.left.pixels : 0,
    right: regions.right.pixels > 0 ? regions.right.weight / regions.right.pixels : 0,
    center: regions.center.pixels > 0 ? regions.center.weight / regions.center.pixels : 0,
  };

  // Normalize to 0-100
  const maxWeight = Math.max(...Object.values(visualWeight));
  for (const key of Object.keys(visualWeight) as (keyof typeof visualWeight)[]) {
    visualWeight[key] = maxWeight > 0 ? (visualWeight[key] / maxWeight) * 100 : 50;
  }

  // Balance detection
  const horizontalBalance = visualWeight.left - visualWeight.right;
  const verticalBalance = visualWeight.top - visualWeight.bottom;

  let balance: SpatialAnalysis["balance"];
  if (Math.abs(horizontalBalance) < 15 && Math.abs(verticalBalance) < 15) {
    balance = visualWeight.center > 60 ? "centered" : "symmetric";
  } else if (horizontalBalance > 20) {
    balance = "asymmetric-left";
  } else if (horizontalBalance < -20) {
    balance = "asymmetric-right";
  } else if (verticalBalance > 20) {
    balance = "asymmetric-top";
  } else {
    balance = "asymmetric-bottom";
  }

  // Grid detection (simplified - looking for vertical lines of similar color)
  const columnScores: number[] = [];
  for (let x = 0; x < width; x += Math.floor(width / 20)) {
    let consistency = 0;
    for (let y = 0; y < height - 10; y += 10) {
      const i1 = (y * width + x) * 4;
      const i2 = ((y + 10) * width + x) * 4;
      const diff = Math.abs(data[i1] - data[i2]) + Math.abs(data[i1 + 1] - data[i2 + 1]) + Math.abs(data[i1 + 2] - data[i2 + 2]);
      if (diff < 50) consistency++;
    }
    columnScores.push(consistency);
  }

  // Find peaks in column consistency
  const avgConsistency = columnScores.reduce((a, b) => a + b, 0) / columnScores.length;
  const peaks = columnScores.filter((s) => s > avgConsistency * 1.2).length;
  const possibleColumns = Math.max(1, Math.min(12, peaks));

  // Find focal points (areas of high contrast/weight)
  const focalPoints: SpatialAnalysis["focalPoints"] = [];
  const gridSize = 5;
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let cellWeight = 0;
      let cellPixels = 0;

      for (let y = Math.floor(gy * cellHeight); y < Math.floor((gy + 1) * cellHeight); y++) {
        for (let x = Math.floor(gx * cellWidth); x < Math.floor((gx + 1) * cellWidth); x++) {
          const i = (y * width + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          cellWeight += (255 - lum) / 255 + hsl.s / 100;
          cellPixels++;
        }
      }

      const avgWeight = cellWeight / cellPixels;
      if (avgWeight > 0.6) {
        focalPoints.push({
          x: (gx + 0.5) / gridSize,
          y: (gy + 0.5) / gridSize,
          intensity: avgWeight,
        });
      }
    }
  }

  focalPoints.sort((a, b) => b.intensity - a.intensity);

  return {
    density,
    densityScore,
    whitespacePercentage,
    visualWeight,
    balance,
    gridDetection: {
      possibleColumns,
      confidence: Math.min(100, peaks * 15),
    },
    focalPoints: focalPoints.slice(0, 5),
  };
}

// ============================================================================
// GEOMETRY ANALYSIS
// ============================================================================

function analyzeGeometry(imageData: ImageData): GeometryAnalysis {
  const { data, width, height } = imageData;

  // Edge detection using Sobel operator
  const edges: boolean[][] = [];
  let totalEdges = 0;

  for (let y = 1; y < height - 1; y++) {
    edges[y] = [];
    for (let x = 1; x < width - 1; x++) {
      // Simplified Sobel
      const getGray = (px: number, py: number) => {
        const i = (py * width + px) * 4;
        return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      };

      const gx =
        -getGray(x - 1, y - 1) + getGray(x + 1, y - 1) +
        -2 * getGray(x - 1, y) + 2 * getGray(x + 1, y) +
        -getGray(x - 1, y + 1) + getGray(x + 1, y + 1);

      const gy =
        -getGray(x - 1, y - 1) - 2 * getGray(x, y - 1) - getGray(x + 1, y - 1) +
        getGray(x - 1, y + 1) + 2 * getGray(x, y + 1) + getGray(x + 1, y + 1);

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y][x] = magnitude > 50;
      if (edges[y][x]) totalEdges++;
    }
  }

  const edgeDensity = (totalEdges / (width * height)) * 100;

  // Corner detection (simplified Harris-like)
  let sharpCorners = 0;
  let roundedCorners = 0;

  // Sample corners by looking for L-shaped edge patterns
  const sampleSize = 20;
  for (let sy = 0; sy < height; sy += Math.floor(height / sampleSize)) {
    for (let sx = 0; sx < width; sx += Math.floor(width / sampleSize)) {
      // Check for corner patterns in 5x5 region
      let horizontalEdges = 0;
      let verticalEdges = 0;
      let diagonalEdges = 0;

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const y = sy + dy;
          const x = sx + dx;
          if (y > 0 && y < height - 1 && x > 0 && x < width - 1 && edges[y]?.[x]) {
            if (Math.abs(dx) > Math.abs(dy)) horizontalEdges++;
            else if (Math.abs(dy) > Math.abs(dx)) verticalEdges++;
            else diagonalEdges++;
          }
        }
      }

      // Sharp corner: clear horizontal and vertical edges meeting
      if (horizontalEdges > 2 && verticalEdges > 2 && diagonalEdges < 3) {
        sharpCorners++;
      }
      // Rounded corner: diagonal edges present
      if (diagonalEdges > 3) {
        roundedCorners++;
      }
    }
  }

  // Estimate corner style and radius
  const totalCorners = sharpCorners + roundedCorners;
  const roundedRatio = totalCorners > 0 ? roundedCorners / totalCorners : 0.5;

  let cornerStyle: GeometryAnalysis["cornerStyle"];
  let avgRadius: number;

  if (roundedRatio < 0.2) {
    cornerStyle = "sharp";
    avgRadius = 2;
  } else if (roundedRatio < 0.4) {
    cornerStyle = "soft";
    avgRadius = 6;
  } else if (roundedRatio < 0.7) {
    cornerStyle = "rounded";
    avgRadius = 12;
  } else if (roundedRatio < 0.9) {
    cornerStyle = "pill";
    avgRadius = 24;
  } else {
    cornerStyle = "mixed";
    avgRadius = 10;
  }

  // Linearity estimation (straight vs curved)
  // Based on edge direction consistency
  const linearity = Math.max(0, Math.min(100, (1 - roundedRatio) * 80 + 20));

  return {
    cornerStyle,
    estimatedRadius: {
      min: Math.max(0, avgRadius - 4),
      max: avgRadius + 8,
      average: avgRadius,
    },
    edgeDensity,
    linearity,
    shapes: {
      rectangles: sharpCorners,
      circles: Math.floor(roundedCorners * 0.3),
      organic: Math.floor(roundedCorners * 0.7),
    },
  };
}

// ============================================================================
// EFFECTS ANALYSIS
// ============================================================================

function analyzeEffects(imageData: ImageData, colorAnalysis: ColorAnalysis): EffectsAnalysis {
  const { data, width, height } = imageData;

  // Gradient detection
  let gradientRegions = 0;
  let totalRegions = 0;
  const gradientDirections: string[] = [];
  const sampleSize = 10;

  for (let sy = 0; sy < height - sampleSize; sy += sampleSize) {
    for (let sx = 0; sx < width - sampleSize; sx += sampleSize) {
      totalRegions++;

      // Sample colors at corners of region
      const getColor = (x: number, y: number) => {
        const i = (y * width + x) * 4;
        return { r: data[i], g: data[i + 1], b: data[i + 2] };
      };

      const tl = getColor(sx, sy);
      const tr = getColor(sx + sampleSize, sy);
      const bl = getColor(sx, sy + sampleSize);
      const br = getColor(sx + sampleSize, sy + sampleSize);

      // Check for smooth color transitions
      const hDiff = colorDistance(tl, tr) + colorDistance(bl, br);
      const vDiff = colorDistance(tl, bl) + colorDistance(tr, br);
      const dDiff = colorDistance(tl, br);

      // If there's a smooth transition (not sharp edge)
      if (hDiff > 20 && hDiff < 150) {
        gradientRegions++;
        if (vDiff < hDiff * 0.5) {
          gradientDirections.push("horizontal");
        }
      }
      if (vDiff > 20 && vDiff < 150) {
        if (!gradientDirections.includes("horizontal") || hDiff < vDiff * 0.5) {
          gradientRegions++;
          gradientDirections.push("vertical");
        }
      }
      if (dDiff > 20 && dDiff < 200 && hDiff < 100 && vDiff < 100) {
        gradientDirections.push("diagonal");
      }
    }
  }

  const hasGradients = gradientRegions / totalRegions > 0.1;

  // Shadow detection (looking for dark, semi-transparent regions)
  let shadowPixels = 0;
  let darkPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const hsl = rgbToHsl(r, g, b);

    // Dark, desaturated pixels could be shadows
    if (hsl.l < 30 && hsl.s < 30) {
      darkPixels++;
      if (hsl.l < 15) shadowPixels++;
    }
  }

  const totalPixels = width * height;
  const shadowRatio = shadowPixels / totalPixels;
  const shadowScore = Math.min(100, shadowRatio * 1000);

  let shadowIntensity: EffectsAnalysis["shadows"]["intensity"];
  if (shadowScore < 5) shadowIntensity = "none";
  else if (shadowScore < 20) shadowIntensity = "subtle";
  else if (shadowScore < 50) shadowIntensity = "medium";
  else shadowIntensity = "dramatic";

  // Depth estimation based on lightness distribution and shadows
  const depthScore =
    shadowScore * 0.4 +
    colorAnalysis.contrastRatio * 3 +
    (colorAnalysis.lightnessDistribution.dark > 20 ? 20 : 0);

  let depth: EffectsAnalysis["depth"];
  if (depthScore < 20) depth = "flat";
  else if (depthScore < 40) depth = "subtle";
  else if (depthScore < 70) depth = "material";
  else depth = "neumorphic";

  // Glassmorphism detection (blur + transparency patterns)
  // Look for regions with low saturation variance (blurred) near high contrast edges
  let blurScore = 0;
  const blurSamples = 50;
  for (let s = 0; s < blurSamples; s++) {
    const x = Math.floor(Math.random() * (width - 10)) + 5;
    const y = Math.floor(Math.random() * (height - 10)) + 5;

    // Check 5x5 region for color smoothness
    let variance = 0;
    const centerColor = {
      r: data[(y * width + x) * 4],
      g: data[(y * width + x) * 4 + 1],
      b: data[(y * width + x) * 4 + 2],
    };

    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const i = ((y + dy) * width + (x + dx)) * 4;
        variance += Math.abs(data[i] - centerColor.r);
        variance += Math.abs(data[i + 1] - centerColor.g);
        variance += Math.abs(data[i + 2] - centerColor.b);
      }
    }

    const avgVariance = variance / (25 * 3);
    if (avgVariance < 15 && avgVariance > 3) {
      blurScore++;
    }
  }

  const glassmorphismScore = Math.min(100, (blurScore / blurSamples) * 150);
  const hasGlassmorphism = glassmorphismScore > 30;

  // Noise detection
  let noisePixels = 0;
  for (let i = 0; i < data.length - 4; i += 4) {
    const diff = Math.abs(data[i] - data[i + 4]) +
                 Math.abs(data[i + 1] - data[i + 5]) +
                 Math.abs(data[i + 2] - data[i + 6]);
    if (diff > 5 && diff < 20) noisePixels++;
  }
  const noiseLevel = (noisePixels / totalPixels) * 100;
  const hasNoise = noiseLevel > 10;

  return {
    hasGlassmorphism,
    glassmorphismScore,
    gradients: {
      detected: hasGradients,
      count: new Set(gradientDirections).size,
      directions: [...new Set(gradientDirections)],
      types: hasGradients ? ["linear"] : [],
    },
    shadows: {
      intensity: shadowIntensity,
      score: shadowScore,
      direction: shadowScore > 10 ? "bottom-right" : "none",
    },
    depth,
    depthScore,
    hasNoise,
    noiseLevel,
  };
}

// ============================================================================
// STYLE ANALYSIS
// ============================================================================

function analyzeStyle(
  colorAnalysis: ColorAnalysis,
  spatialAnalysis: SpatialAnalysis,
  geometryAnalysis: GeometryAnalysis,
  effectsAnalysis: EffectsAnalysis
): StyleAnalysis {
  // Minimalism score
  // High whitespace, low edge density, simple geometry
  const minimalism = Math.min(100, Math.max(0,
    spatialAnalysis.whitespacePercentage * 0.4 +
    (100 - geometryAnalysis.edgeDensity) * 0.3 +
    (geometryAnalysis.cornerStyle === "rounded" || geometryAnalysis.cornerStyle === "soft" ? 20 : 0) +
    (colorAnalysis.paletteType === "monochromatic" ? 20 : 0)
  ));

  // Complexity score
  const complexity = Math.min(100, Math.max(0,
    geometryAnalysis.edgeDensity * 0.5 +
    (effectsAnalysis.gradients.count * 10) +
    (effectsAnalysis.shadows.score * 0.3) +
    (100 - spatialAnalysis.whitespacePercentage) * 0.2
  ));

  // Modernness score
  // Modern: rounded corners, vibrant colors, gradients, clean layout
  const modernness = Math.min(100, Math.max(0,
    (geometryAnalysis.cornerStyle === "rounded" || geometryAnalysis.cornerStyle === "pill" ? 30 : 10) +
    (colorAnalysis.saturation === "vibrant" ? 25 : colorAnalysis.saturation === "moderate" ? 15 : 5) +
    (effectsAnalysis.gradients.detected ? 20 : 0) +
    (effectsAnalysis.hasGlassmorphism ? 15 : 0) +
    (spatialAnalysis.balance === "symmetric" || spatialAnalysis.balance === "centered" ? 10 : 5)
  ));

  // Elegance score
  const elegance = Math.min(100, Math.max(0,
    minimalism * 0.3 +
    (colorAnalysis.saturation === "muted" || colorAnalysis.saturation === "moderate" ? 25 : 10) +
    (effectsAnalysis.shadows.intensity === "subtle" ? 20 : 10) +
    (geometryAnalysis.cornerStyle === "soft" || geometryAnalysis.cornerStyle === "rounded" ? 15 : 5)
  ));

  // Boldness score
  const boldness = Math.min(100, Math.max(0,
    (colorAnalysis.saturation === "vibrant" ? 30 : 10) +
    (colorAnalysis.contrast === "high" ? 25 : 10) +
    (effectsAnalysis.shadows.intensity === "dramatic" ? 20 : 5) +
    complexity * 0.2
  ));

  // Industry detection based on visual patterns
  interface IndustryScore {
    tech: number;
    finance: number;
    creative: number;
    healthcare: number;
    ecommerce: number;
    media: number;
    general: number;
  }

  const industryScores: IndustryScore = {
    tech: 0,
    finance: 0,
    creative: 0,
    healthcare: 0,
    ecommerce: 0,
    media: 0,
    general: 50,
  };

  // Tech: modern, gradients, dark themes, high saturation blues/purples
  if (colorAnalysis.lightnessDistribution.dark > 40) industryScores.tech += 20;
  if (effectsAnalysis.gradients.detected) industryScores.tech += 15;
  if (colorAnalysis.paletteType !== "monochromatic") industryScores.tech += 10;
  if (modernness > 60) industryScores.tech += 15;

  // Finance: conservative, blues, high contrast, symmetric
  if (colorAnalysis.temperature === "cool") industryScores.finance += 20;
  if (spatialAnalysis.balance === "symmetric") industryScores.finance += 15;
  if (minimalism > 50) industryScores.finance += 10;

  // Creative: vibrant, asymmetric, complex
  if (colorAnalysis.saturation === "vibrant") industryScores.creative += 25;
  if (spatialAnalysis.balance.startsWith("asymmetric")) industryScores.creative += 15;
  if (complexity > 60) industryScores.creative += 10;

  // Healthcare: light, clean, greens/blues, minimal
  if (colorAnalysis.lightnessDistribution.light > 50) industryScores.healthcare += 20;
  if (minimalism > 60) industryScores.healthcare += 15;
  if (colorAnalysis.temperature === "cool") industryScores.healthcare += 10;

  // E-commerce: warm, high contrast, dense content
  if (colorAnalysis.temperature === "warm") industryScores.ecommerce += 15;
  if (spatialAnalysis.density === "dense") industryScores.ecommerce += 15;
  if (colorAnalysis.contrast === "high") industryScores.ecommerce += 10;

  // Media: bold, high contrast, dynamic
  if (boldness > 60) industryScores.media += 20;
  if (colorAnalysis.contrast === "high") industryScores.media += 15;

  const topIndustry = (Object.entries(industryScores) as [keyof IndustryScore, number][])
    .sort(([, a], [, b]) => b - a)[0];

  // Aesthetic tags
  const aestheticTags: string[] = [];

  if (minimalism > 70) aestheticTags.push("Minimalist");
  if (boldness > 70) aestheticTags.push("Bold");
  if (elegance > 70) aestheticTags.push("Elegant");
  if (modernness > 70) aestheticTags.push("Modern");
  if (effectsAnalysis.hasGlassmorphism) aestheticTags.push("Glassmorphism");
  if (effectsAnalysis.gradients.detected) aestheticTags.push("Gradient-rich");
  if (colorAnalysis.lightnessDistribution.dark > 60) aestheticTags.push("Dark Mode");
  if (colorAnalysis.lightnessDistribution.light > 60) aestheticTags.push("Light Mode");
  if (colorAnalysis.temperature === "warm") aestheticTags.push("Warm");
  if (colorAnalysis.temperature === "cool") aestheticTags.push("Cool");
  if (colorAnalysis.saturation === "vibrant") aestheticTags.push("Vibrant");
  if (colorAnalysis.saturation === "muted") aestheticTags.push("Muted");
  if (effectsAnalysis.depth === "flat") aestheticTags.push("Flat Design");
  if (effectsAnalysis.depth === "neumorphic") aestheticTags.push("Neumorphic");
  if (geometryAnalysis.cornerStyle === "pill") aestheticTags.push("Pill-shaped");
  if (spatialAnalysis.density === "spacious") aestheticTags.push("Airy");

  // Era detection
  let era: StyleAnalysis["era"];
  if (effectsAnalysis.depth === "flat" && minimalism > 60) {
    era = "modern";
  } else if (effectsAnalysis.hasGlassmorphism || geometryAnalysis.cornerStyle === "pill") {
    era = "futuristic";
  } else if (effectsAnalysis.shadows.intensity === "dramatic" && geometryAnalysis.cornerStyle === "sharp") {
    era = "classic";
  } else {
    era = "modern";
  }

  return {
    minimalism,
    complexity,
    modernness,
    elegance,
    boldness,
    industry: topIndustry[0],
    industryConfidence: Math.min(100, topIndustry[1]),
    aestheticTags: aestheticTags.slice(0, 8),
    era,
  };
}

// ============================================================================
// MAIN ANALYZER
// ============================================================================

export async function analyzeImage(imageSource: string | HTMLImageElement): Promise<ImageAnalysisResult> {
  const startTime = performance.now();

  // Load image
  const img = typeof imageSource === "string" ? await loadImage(imageSource) : imageSource;

  // Create canvas and get image data
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Scale down for performance if needed
  const maxDimension = 800;
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);

  // Run analyses
  const colorAnalysis = analyzeColors(imageData);
  const spatialAnalysis = analyzeSpatial(imageData);
  const geometryAnalysis = analyzeGeometry(imageData);
  const effectsAnalysis = analyzeEffects(imageData, colorAnalysis);
  const styleAnalysis = analyzeStyle(colorAnalysis, spatialAnalysis, geometryAnalysis, effectsAnalysis);

  const processingTime = performance.now() - startTime;

  return {
    colors: colorAnalysis,
    spatial: spatialAnalysis,
    geometry: geometryAnalysis,
    effects: effectsAnalysis,
    style: styleAnalysis,
    metadata: {
      width: img.width,
      height: img.height,
      aspectRatio: img.width / img.height,
      analyzedAt: new Date().toISOString(),
      processingTime,
    },
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Export individual analyzers for targeted use
export { analyzeColors, analyzeSpatial, analyzeGeometry, analyzeEffects, analyzeStyle };

