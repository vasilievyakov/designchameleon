"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn, getContrastColor, hexToHsl, copyToClipboard } from "@/lib/utils";
import type { ColorPalette as ColorPaletteType, Gradient } from "@/types/design-system";

interface ColorPaletteProps {
  colors: ColorPaletteType;
  gradients: Gradient[];
}

interface ColorSwatchProps {
  name: string;
  color: string;
  index: number;
  size?: "sm" | "md" | "lg";
}

function ColorSwatch({ name, color, index, size = "md" }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const hsl = hexToHsl(color);
  const contrastColor = getContrastColor(color);

  const handleCopy = async () => {
    await copyToClipboard(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <button
        onClick={handleCopy}
        className={cn(
          "w-full rounded-xl overflow-hidden transition-all duration-300",
          "hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: contrastColor }}
        >
          {copied ? (
            <Check className="w-6 h-6" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </div>
      </button>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm font-medium capitalize">{name.replace(/([A-Z])/g, " $1").trim()}</p>
        <p className="text-xs text-muted-foreground font-mono">{color.toUpperCase()}</p>
        <p className="text-xs text-muted-foreground">
          {hsl.h}° {hsl.s}% {hsl.l}%
        </p>
      </div>
    </motion.div>
  );
}

function GradientSwatch({ gradient, index }: { gradient: Gradient; index: number }) {
  const [copied, setCopied] = useState(false);

  const gradientStyle = gradient.via
    ? `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.via}, ${gradient.to})`
    : `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.to})`;

  const handleCopy = async () => {
    await copyToClipboard(gradientStyle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
      className="group"
    >
      <button
        onClick={handleCopy}
        className="w-full h-20 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={{ background: gradientStyle }}
      >
        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          {copied ? (
            <Check className="w-6 h-6 text-white" />
          ) : (
            <Copy className="w-5 h-5 text-white" />
          )}
        </div>
      </button>
      <p className="mt-2 text-sm font-medium">Gradient {index + 1}</p>
      <p className="text-xs text-muted-foreground">{gradient.direction}</p>
    </motion.div>
  );
}

export function ColorPalette({ colors, gradients }: ColorPaletteProps) {
  const primaryColors = [
    { name: "primary", color: colors.primary },
    { name: "secondary", color: colors.secondary },
    { name: "accent", color: colors.accent },
  ];

  const backgroundColors = [
    { name: "background", color: colors.background },
    { name: "foreground", color: colors.foreground },
    { name: "card", color: colors.card },
    { name: "muted", color: colors.muted },
    { name: "border", color: colors.border },
  ];

  const semanticColors = [
    { name: "success", color: colors.success },
    { name: "error", color: colors.error },
    { name: "warning", color: colors.warning },
    { name: "info", color: colors.info },
  ];

  return (
    <div className="space-y-8">
      {/* Primary Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary" />
          Primary Colors
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {primaryColors.map((item, index) => (
            <ColorSwatch key={item.name} {...item} index={index} size="lg" />
          ))}
        </div>
      </div>

      {/* Background & Surface Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-muted" />
          Backgrounds & Surfaces
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {backgroundColors.map((item, index) => (
            <ColorSwatch key={item.name} {...item} index={index + 3} size="md" />
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success" />
          Semantic Colors
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {semanticColors.map((item, index) => (
            <ColorSwatch key={item.name} {...item} index={index + 8} size="sm" />
          ))}
        </div>
      </div>

      {/* Gradients */}
      {gradients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary via-accent to-secondary" />
            Gradients
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {gradients.map((gradient, index) => (
              <GradientSwatch key={index} gradient={gradient} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

