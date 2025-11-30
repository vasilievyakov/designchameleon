"use client";

import { motion } from "framer-motion";
import { Square, Sun, Ruler } from "lucide-react";
import type { Styles } from "@/types/design-system";

interface StylesDisplayProps {
  styles: Styles;
}

export function StylesDisplay({ styles }: StylesDisplayProps) {
  const radiusEntries = Object.entries(styles.borderRadius);
  const shadowEntries = Object.entries(styles.shadows);
  const spacingEntries = Object.entries(styles.spacing);

  return (
    <div className="space-y-8">
      {/* Border Radius */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Square className="w-4 h-4 text-primary" />
          Border Radius
        </h3>
        <div className="grid grid-cols-6 gap-4">
          {radiusEntries.map(([name, value], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="text-center"
            >
              <div
                className="w-full aspect-square bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-2"
                style={{ borderRadius: value }}
              />
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground font-mono">{value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" />
          Shadows
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {shadowEntries.map(([name, value], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="text-center"
            >
              <div
                className="w-full aspect-square bg-card rounded-xl mb-3 flex items-center justify-center"
                style={{ boxShadow: value }}
              >
                <span className="text-2xl font-bold text-muted-foreground/50">{name}</span>
              </div>
              <p className="text-sm font-medium capitalize">{name}</p>
              <p className="text-xs text-muted-foreground font-mono truncate" title={value}>
                {value.length > 30 ? value.substring(0, 30) + "..." : value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" />
          Spacing Scale
        </h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="p-6 rounded-xl bg-card border border-border"
        >
          <div className="space-y-3">
            {spacingEntries.map(([name, value]) => (
              <div key={name} className="flex items-center gap-4">
                <span className="w-12 text-sm font-medium">{name}</span>
                <div
                  className="h-4 bg-gradient-to-r from-primary to-accent rounded"
                  style={{ width: value }}
                />
                <span className="text-sm text-muted-foreground font-mono">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

