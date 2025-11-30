"use client";

import { motion } from "framer-motion";
import { Type, Heading, AlignLeft, Code } from "lucide-react";
import type { Typography } from "@/types/design-system";

interface TypographyDisplayProps {
  typography: Typography;
}

export function TypographyDisplay({ typography }: TypographyDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Font Families */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          Font Families
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heading className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Headings</span>
            </div>
            <p className="text-2xl font-bold truncate">{typography.headingFont}</p>
            <p className="text-xs text-muted-foreground mt-1">Weight: {typography.headingWeight}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Body</span>
            </div>
            <p className="text-2xl truncate">{typography.bodyFont}</p>
            <p className="text-xs text-muted-foreground mt-1">Weight: {typography.bodyWeight}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Monospace</span>
            </div>
            <p className="text-2xl font-mono truncate">{typography.monoFont}</p>
            <p className="text-xs text-muted-foreground mt-1">For code blocks</p>
          </motion.div>
        </div>
      </div>

      {/* Type Scale */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heading className="w-4 h-4 text-primary" />
          Type Scale
        </h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-6 rounded-xl bg-card border border-border space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <span className="text-4xl font-bold" style={{ fontSize: typography.headingSizes.h1 }}>
                Heading 1
              </span>
              <span className="text-sm text-muted-foreground font-mono">{typography.headingSizes.h1}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <span className="text-3xl font-bold" style={{ fontSize: typography.headingSizes.h2 }}>
                Heading 2
              </span>
              <span className="text-sm text-muted-foreground font-mono">{typography.headingSizes.h2}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <span className="text-2xl font-semibold" style={{ fontSize: typography.headingSizes.h3 }}>
                Heading 3
              </span>
              <span className="text-sm text-muted-foreground font-mono">{typography.headingSizes.h3}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <span className="text-xl font-semibold" style={{ fontSize: typography.headingSizes.h4 }}>
                Heading 4
              </span>
              <span className="text-sm text-muted-foreground font-mono">{typography.headingSizes.h4}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span style={{ fontSize: typography.bodySizes.large }}>Body Large - Perfect for lead paragraphs</span>
              <span className="text-sm text-muted-foreground font-mono">{typography.bodySizes.large}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span style={{ fontSize: typography.bodySizes.base }}>Body Base - Standard paragraph text</span>
              <span className="text-sm text-muted-foreground font-mono">{typography.bodySizes.base}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span style={{ fontSize: typography.bodySizes.small }} className="text-muted-foreground">
                Body Small - For captions and metadata
              </span>
              <span className="text-sm text-muted-foreground font-mono">{typography.bodySizes.small}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Line Heights */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-primary" />
          Line Heights
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <p className="text-sm text-muted-foreground mb-2">Headings</p>
            <p className="text-3xl font-bold">{typography.lineHeight.heading}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <p className="text-sm text-muted-foreground mb-2">Body Text</p>
            <p className="text-3xl">{typography.lineHeight.body}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

