"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pipette, Check, X, RotateCcw } from "lucide-react";
import { cn, hexToHsl, getContrastColor } from "@/lib/utils";
import type { ColorPalette } from "@/types/design-system";

interface ColorEditorProps {
  colors: ColorPalette;
  onChange: (colors: ColorPalette) => void;
}

interface ColorPickerProps {
  color: string;
  label: string;
  onChange: (color: string) => void;
  originalColor: string;
}

function ColorPicker({ color, label, onChange, originalColor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempColor(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setTempColor(color);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, color]);

  const handleConfirm = () => {
    onChange(tempColor);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempColor(originalColor);
    onChange(originalColor);
    setIsOpen(false);
  };

  const hsl = hexToHsl(tempColor);
  const contrastColor = getContrastColor(tempColor);
  const hasChanged = color !== originalColor;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative w-full h-16 rounded-xl overflow-hidden transition-all duration-300",
          "hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
          hasChanged && "ring-2 ring-accent"
        )}
        style={{ backgroundColor: color }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: contrastColor }}
        >
          <Pipette className="w-5 h-5" />
        </div>
        {hasChanged && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
        )}
      </button>
      <p className="mt-2 text-sm font-medium capitalize">
        {label.replace(/([A-Z])/g, " $1").trim()}
      </p>
      <p className="text-xs text-muted-foreground font-mono">{color.toUpperCase()}</p>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 p-4 rounded-xl bg-card border border-border shadow-xl min-w-[220px]"
          >
            {/* Color Preview */}
            <div
              className="w-full h-20 rounded-lg mb-3"
              style={{ backgroundColor: tempColor }}
            />

            {/* Native Color Input */}
            <div className="relative mb-3">
              <input
                ref={inputRef}
                type="color"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                <div
                  className="w-6 h-6 rounded border border-white/20"
                  style={{ backgroundColor: tempColor }}
                />
                <input
                  type="text"
                  value={tempColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setTempColor(val);
                    }
                  }}
                  className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* HSL Display */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
              <div className="p-2 rounded bg-muted">
                <p className="text-muted-foreground">H</p>
                <p className="font-mono">{hsl.h}°</p>
              </div>
              <div className="p-2 rounded bg-muted">
                <p className="text-muted-foreground">S</p>
                <p className="font-mono">{hsl.s}%</p>
              </div>
              <div className="p-2 rounded bg-muted">
                <p className="text-muted-foreground">L</p>
                <p className="font-mono">{hsl.l}%</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
                title="Reset to original"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTempColor(color);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ColorEditor({ colors, onChange }: ColorEditorProps) {
  const [originalColors] = useState(colors);

  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  const primaryColors = [
    { key: "primary" as const, label: "Primary" },
    { key: "secondary" as const, label: "Secondary" },
    { key: "accent" as const, label: "Accent" },
  ];

  const backgroundColors = [
    { key: "background" as const, label: "Background" },
    { key: "foreground" as const, label: "Foreground" },
    { key: "card" as const, label: "Card" },
    { key: "muted" as const, label: "Muted" },
    { key: "border" as const, label: "Border" },
  ];

  const semanticColors = [
    { key: "success" as const, label: "Success" },
    { key: "error" as const, label: "Error" },
    { key: "warning" as const, label: "Warning" },
    { key: "info" as const, label: "Info" },
  ];

  const hasChanges = JSON.stringify(colors) !== JSON.stringify(originalColors);

  return (
    <div className="space-y-8">
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20"
        >
          <p className="text-sm text-accent flex items-center gap-2">
            <Pipette className="w-4 h-4" />
            Colors have been modified
          </p>
          <button
            onClick={() => onChange(originalColors)}
            className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </motion.div>
      )}

      {/* Primary Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary" />
          Primary Colors
          <span className="text-xs text-muted-foreground font-normal ml-2">
            Click to edit
          </span>
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {primaryColors.map(({ key, label }) => (
            <ColorPicker
              key={key}
              color={colors[key]}
              label={label}
              onChange={(value) => handleColorChange(key, value)}
              originalColor={originalColors[key]}
            />
          ))}
        </div>
      </div>

      {/* Background Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-muted" />
          Backgrounds & Surfaces
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {backgroundColors.map(({ key, label }) => (
            <ColorPicker
              key={key}
              color={colors[key]}
              label={label}
              onChange={(value) => handleColorChange(key, value)}
              originalColor={originalColors[key]}
            />
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
          {semanticColors.map(({ key, label }) => (
            <ColorPicker
              key={key}
              color={colors[key]}
              label={label}
              onChange={(value) => handleColorChange(key, value)}
              originalColor={originalColors[key]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

