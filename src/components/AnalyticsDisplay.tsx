"use client";

import { motion } from "framer-motion";
import {
  Thermometer,
  Palette,
  Grid3X3,
  Sparkles,
  Layers,
  Target,
  Activity,
  Zap,
  Eye,
  Sun,
  Moon,
  BarChart3,
  Hexagon,
  Circle,
  Square,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageAnalysisResult } from "@/lib/image-analyzer";

interface AnalyticsDisplayProps {
  analysis: ImageAnalysisResult;
}

function ScoreBar({
  value,
  label,
  color = "primary",
  showValue = true,
}: {
  value: number;
  label: string;
  color?: string;
  showValue?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    primary: "from-primary to-primary/50",
    secondary: "from-secondary to-secondary/50",
    accent: "from-accent to-accent/50",
    success: "from-success to-success/50",
    warning: "from-warning to-warning/50",
    info: "from-info to-info/50",
    error: "from-error to-error/50",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showValue && <span className="font-mono font-medium">{Math.round(value)}%</span>}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-gradient-to-r", colorClasses[color])}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 rounded-xl bg-muted/50 border border-border"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
}

function ColorDot({ color, size = "md" }: { color: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div
      className={cn("rounded-full border border-white/20", sizeClasses[size])}
      style={{ backgroundColor: color }}
    />
  );
}

function TagPill({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "primary" | "accent" }) {
  const variants = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/20 text-primary border-primary/30",
    accent: "bg-accent/20 text-accent border-accent/30",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", variants[variant])}>
      {children}
    </span>
  );
}

export function AnalyticsDisplay({ analysis }: AnalyticsDisplayProps) {
  const { colors, spatial, geometry, effects, style, metadata } = analysis;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-4 gap-4"
      >
        <MetricCard
          icon={Activity}
          title="Processing Time"
          value={`${Math.round(metadata.processingTime)}ms`}
          delay={0}
        />
        <MetricCard
          icon={Grid3X3}
          title="Resolution"
          value={`${metadata.width}×${metadata.height}`}
          subtitle={`${metadata.aspectRatio.toFixed(2)} ratio`}
          delay={0.1}
        />
        <MetricCard
          icon={Target}
          title="Industry Match"
          value={style.industry}
          subtitle={`${Math.round(style.industryConfidence)}% confidence`}
          delay={0.2}
        />
        <MetricCard
          icon={Sparkles}
          title="Era"
          value={style.era}
          subtitle={`${style.aestheticTags.length} style tags`}
          delay={0.3}
        />
      </motion.div>

      {/* Style Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2"
      >
        {style.aestheticTags.map((tag, i) => (
          <TagPill key={tag} variant={i < 3 ? "primary" : "default"}>
            {tag}
          </TagPill>
        ))}
      </motion.div>

      {/* Color Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Color Analysis</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Dominant Colors */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Dominant Colors</p>
              <div className="flex gap-2">
                {colors.dominantColors.slice(0, 6).map((c, i) => (
                  <div key={i} className="text-center">
                    <ColorDot color={c.hex} size="lg" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(c.percentage)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Proportions */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">60-30-10 Distribution</p>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${colors.proportions.primary}%`,
                    backgroundColor: colors.palette.primary,
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${colors.proportions.secondary}%`,
                    backgroundColor: colors.palette.secondary,
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${colors.proportions.accent}%`,
                    backgroundColor: colors.palette.accent,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Primary {Math.round(colors.proportions.primary)}%</span>
                <span>Secondary {Math.round(colors.proportions.secondary)}%</span>
                <span>Accent {Math.round(colors.proportions.accent)}%</span>
              </div>
            </div>

            {/* Extracted Palette */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Extracted Palette</p>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(colors.palette).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-full aspect-square rounded-lg border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Temperature */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  colors.temperature === "warm" ? "bg-orange-500/20 text-orange-400" :
                  colors.temperature === "cool" ? "bg-blue-500/20 text-blue-400" :
                  "bg-gray-500/20 text-gray-400"
                )}>
                  {colors.temperature}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-gray-400 to-orange-500">
                <div
                  className="w-3 h-3 rounded-full bg-white border-2 border-foreground -mt-0.5"
                  style={{ marginLeft: `${(colors.temperatureScore + 100) / 2}%`, transform: "translateX(-50%)" }}
                />
              </div>
            </div>

            {/* Saturation */}
            <ScoreBar
              value={colors.saturationScore}
              label={`Saturation: ${colors.saturation}`}
              color="secondary"
            />

            {/* Contrast */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm">Contrast Ratio</span>
                <span className="font-mono font-bold">{colors.contrastRatio.toFixed(1)}:1</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {colors.contrast} contrast
                {colors.contrastRatio >= 4.5 ? " (WCAG AA ✓)" : ""}
              </p>
            </div>

            {/* Palette Type */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Hexagon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Palette Type</span>
              </div>
              <p className="font-medium capitalize">{colors.paletteType}</p>
            </div>

            {/* Lightness Distribution */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Lightness Distribution</p>
              <div className="flex gap-2">
                <div className="flex-1 text-center p-2 rounded bg-gray-900 text-white">
                  <Moon className="w-3 h-3 mx-auto mb-1" />
                  <p className="text-xs">{Math.round(colors.lightnessDistribution.dark)}%</p>
                </div>
                <div className="flex-1 text-center p-2 rounded bg-gray-500 text-white">
                  <Activity className="w-3 h-3 mx-auto mb-1" />
                  <p className="text-xs">{Math.round(colors.lightnessDistribution.mid)}%</p>
                </div>
                <div className="flex-1 text-center p-2 rounded bg-gray-200 text-gray-800">
                  <Sun className="w-3 h-3 mx-auto mb-1" />
                  <p className="text-xs">{Math.round(colors.lightnessDistribution.light)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spatial & Geometry Analysis */}
      <div className="grid grid-cols-2 gap-6">
        {/* Spatial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Spatial Analysis</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Content Density</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                spatial.density === "dense" ? "bg-error/20 text-error" :
                spatial.density === "balanced" ? "bg-success/20 text-success" :
                "bg-info/20 text-info"
              )}>
                {spatial.density}
              </span>
            </div>

            <ScoreBar
              value={100 - spatial.whitespacePercentage}
              label="Content Ratio"
              color="accent"
            />

            <ScoreBar
              value={spatial.whitespacePercentage}
              label="Whitespace"
              color="info"
            />

            {/* Visual Weight Distribution */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Visual Weight</p>
              <div className="grid grid-cols-3 gap-1">
                <div />
                <div
                  className="h-8 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: `rgba(99, 102, 241, ${spatial.visualWeight.top / 100})` }}
                >
                  {Math.round(spatial.visualWeight.top)}%
                </div>
                <div />
                <div
                  className="h-8 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: `rgba(99, 102, 241, ${spatial.visualWeight.left / 100})` }}
                >
                  {Math.round(spatial.visualWeight.left)}%
                </div>
                <div
                  className="h-8 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: `rgba(99, 102, 241, ${spatial.visualWeight.center / 100})` }}
                >
                  {Math.round(spatial.visualWeight.center)}%
                </div>
                <div
                  className="h-8 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: `rgba(99, 102, 241, ${spatial.visualWeight.right / 100})` }}
                >
                  {Math.round(spatial.visualWeight.right)}%
                </div>
                <div />
                <div
                  className="h-8 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: `rgba(99, 102, 241, ${spatial.visualWeight.bottom / 100})` }}
                >
                  {Math.round(spatial.visualWeight.bottom)}%
                </div>
                <div />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Balance</span>
              <TagPill variant="accent">{spatial.balance}</TagPill>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Grid Columns</span>
              <span className="font-mono">{spatial.gridDetection.possibleColumns}</span>
            </div>
          </div>
        </motion.div>

        {/* Geometry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-6">
            <Hexagon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Geometry & Effects</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Corner Style</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 bg-primary/20 border border-primary/50"
                  style={{
                    borderRadius:
                      geometry.cornerStyle === "sharp" ? "2px" :
                      geometry.cornerStyle === "soft" ? "4px" :
                      geometry.cornerStyle === "rounded" ? "8px" :
                      geometry.cornerStyle === "pill" ? "12px" : "6px"
                  }}
                />
                <span className="font-medium capitalize">{geometry.cornerStyle}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Estimated Border Radius</p>
              <p className="font-mono">
                {geometry.estimatedRadius.min}px – {geometry.estimatedRadius.max}px
                <span className="text-muted-foreground"> (avg: {geometry.estimatedRadius.average}px)</span>
              </p>
            </div>

            <ScoreBar
              value={geometry.edgeDensity}
              label="Edge Density"
              color="warning"
            />

            <ScoreBar
              value={geometry.linearity}
              label="Linearity (straight vs curved)"
              color="secondary"
            />

            {/* Shape Detection */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Detected Shapes</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  <span className="text-sm">{geometry.shapes.rectangles}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  <span className="text-sm">{geometry.shapes.circles}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hexagon className="w-4 h-4" />
                  <span className="text-sm">{geometry.shapes.organic}</span>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Effects */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Glassmorphism</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                effects.hasGlassmorphism ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
              )}>
                {effects.hasGlassmorphism ? `Yes (${Math.round(effects.glassmorphismScore)}%)` : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gradients</span>
              <span className="font-mono">
                {effects.gradients.detected ? effects.gradients.count : 0}
                {effects.gradients.directions.length > 0 && (
                  <span className="text-muted-foreground"> ({effects.gradients.directions.join(", ")})</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Shadow Intensity</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium capitalize",
                effects.shadows.intensity === "dramatic" ? "bg-primary/20 text-primary" :
                effects.shadows.intensity === "medium" ? "bg-secondary/20 text-secondary" :
                "bg-muted text-muted-foreground"
              )}>
                {effects.shadows.intensity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Depth Style</span>
              <TagPill>{effects.depth}</TagPill>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Style Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-6 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Style Metrics</h3>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${style.minimalism * 2.2} 220`}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(style.minimalism)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Minimalism</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${style.complexity * 2.2} 220`}
                  className="text-secondary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(style.complexity)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Complexity</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${style.modernness * 2.2} 220`}
                  className="text-accent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(style.modernness)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Modernness</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${style.elegance * 2.2} 220`}
                  className="text-info"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(style.elegance)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Elegance</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${style.boldness * 2.2} 220`}
                  className="text-warning"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(style.boldness)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Boldness</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

