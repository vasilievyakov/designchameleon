"use client";

import { useState } from "react";
import { Check, Copy, Palette, Type, Box, Sparkles } from "lucide-react";
import type { DesignSystem } from "@/types/design-system";

interface ExtractedData {
  cssVariables: Record<string, string>;
  colors: { color: string; count: number }[];
  fonts: { family: string; weights: string[]; sizes: string[] }[];
  borderRadii: string[];
  shadows: string[];
  spacings: string[];
  meta: {
    title: string;
    description: string;
    themeColor: string;
  };
}

interface SourceDataDisplayProps {
  extractedData?: ExtractedData | null;
  designSystem: DesignSystem;
  onDesignSystemChange?: (ds: DesignSystem) => void;
}

type ColorRole = keyof DesignSystem["colors"];

const colorRoles: { key: ColorRole; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "muted", label: "Muted" },
  { key: "mutedForeground", label: "Muted Foreground" },
  { key: "card", label: "Card" },
  { key: "cardForeground", label: "Card Foreground" },
  { key: "border", label: "Border" },
  { key: "success", label: "Success" },
  { key: "error", label: "Error" },
  { key: "warning", label: "Warning" },
  { key: "info", label: "Info" },
];

export function SourceDataDisplay({ extractedData, designSystem, onDesignSystemChange }: SourceDataDisplayProps) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing">("colors");
  const [selectedRole, setSelectedRole] = useState<ColorRole | null>(null);

  if (!extractedData) {
    return (
      <div className="p-8 text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-semibold mb-2">No Source Data Available</h3>
        <p className="text-sm text-muted-foreground">
          Analyze a URL to see extracted CSS variables and styles.
        </p>
      </div>
    );
  }

  const { cssVariables, colors, fonts, borderRadii, shadows, spacings } = extractedData;

  // Group CSS variables by type
  const colorVars: { key: string; value: string; normalized: string | null }[] = [];
  const fontVars: { key: string; value: string }[] = [];
  const spacingVars: { key: string; value: string }[] = [];
  const otherVars: { key: string; value: string }[] = [];

  const normalizeColor = (value: string): string | null => {
    const v = value.trim();
    if (v.startsWith('#')) {
      if (v.length === 4) {
        return '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      }
      return v;
    }
    if (v.match(/^\d+\s+[\d.]+%?\s+[\d.]+%?$/)) {
      const parts = v.split(/\s+/);
      return `hsl(${parts[0]}, ${parts[1].includes('%') ? parts[1] : parts[1] + '%'}, ${parts[2].includes('%') ? parts[2] : parts[2] + '%'})`;
    }
    if (v.startsWith('rgb') || v.startsWith('hsl')) return v;
    const namedColors: Record<string, string> = {
      'white': '#ffffff', 'black': '#000000', 'red': '#ff0000',
      'green': '#00ff00', 'blue': '#0000ff', 'transparent': 'transparent'
    };
    return namedColors[v.toLowerCase()] || null;
  };

  for (const [key, value] of Object.entries(cssVariables)) {
    const keyLower = key.toLowerCase();
    const normalized = normalizeColor(value);
    
    if (normalized && normalized !== 'transparent') {
      colorVars.push({ key, value, normalized });
    } else if (keyLower.includes('font') || keyLower.includes('family')) {
      fontVars.push({ key, value });
    } else if (keyLower.includes('spacing') || keyLower.includes('gap') || keyLower.includes('padding') || keyLower.includes('margin') || keyLower.includes('radius')) {
      spacingVars.push({ key, value });
    } else {
      otherVars.push({ key, value });
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(key);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const assignColorToRole = (color: string, role: ColorRole) => {
    if (!onDesignSystemChange) return;
    const updated = {
      ...designSystem,
      colors: {
        ...designSystem.colors,
        [role]: color
      }
    };
    onDesignSystemChange(updated);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        {[
          { id: "colors" as const, label: "Colors", icon: Palette, count: colorVars.length + colors.length },
          { id: "typography" as const, label: "Typography", icon: Type, count: fontVars.length + fonts.length },
          { id: "spacing" as const, label: "Spacing & Styles", icon: Box, count: spacingVars.length + borderRadii.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted-foreground/20">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Role Assignment Dropdown */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedRole(null)}>
          <div className="bg-background border border-border rounded-xl p-4 w-80 max-h-96 overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Assign to: {colorRoles.find(r => r.key === selectedRole)?.label}</h3>
            <div className="space-y-2">
              {colorVars.map((cv) => (
                <button
                  key={cv.key}
                  onClick={() => assignColorToRole(cv.normalized!, selectedRole)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: cv.normalized || undefined }} />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cv.key}</p>
                    <p className="text-xs text-muted-foreground">{cv.value}</p>
                  </div>
                </button>
              ))}
              {colors.map((c, i) => (
                <button
                  key={`computed-${i}`}
                  onClick={() => assignColorToRole(c.color, selectedRole)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: c.color }} />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">{c.color}</p>
                    <p className="text-xs text-muted-foreground">Used {c.count}x</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          {/* Current Assignments */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Current Color Assignments</h3>
            <div className="grid grid-cols-7 gap-2">
              {colorRoles.map((role) => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className="group p-2 rounded-lg border border-border hover:border-foreground/50 transition-colors"
                >
                  <div
                    className="w-full aspect-square rounded mb-2 border border-border"
                    style={{ backgroundColor: designSystem.colors[role.key] }}
                  />
                  <p className="text-[10px] text-center truncate">{role.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Click any color to reassign from extracted values</p>
          </div>

          {/* CSS Variables with Colors */}
          {colorVars.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">CSS Variables ({colorVars.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {colorVars.map((cv) => (
                  <div
                    key={cv.key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
                      style={{ backgroundColor: cv.normalized || undefined }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cv.key}</p>
                      <p className="text-xs text-muted-foreground truncate">{cv.value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cv.value, cv.key)}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    >
                      {copiedVar === cv.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Computed Colors */}
          {colors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Computed Colors ({colors.length})</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <p className="text-xs font-medium">{c.color}</p>
                      <p className="text-[10px] text-muted-foreground">{c.count}x</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <div className="space-y-6">
          {/* Font Variables */}
          {fontVars.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Font Variables ({fontVars.length})</h3>
              <div className="space-y-2">
                {fontVars.map((fv) => (
                  <div
                    key={fv.key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Type className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fv.key}</p>
                      <p className="text-xs text-muted-foreground truncate">{fv.value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(fv.value, fv.key)}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    >
                      {copiedVar === fv.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Fonts */}
          {fonts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Detected Fonts ({fonts.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {fonts.map((font, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border">
                    <p className="font-semibold mb-2" style={{ fontFamily: font.family }}>{font.family}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {font.weights.map((w) => (
                        <span key={w} className="text-xs px-2 py-0.5 rounded bg-muted">{w}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {font.sizes.slice(0, 5).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded bg-muted">{s}</span>
                      ))}
                      {font.sizes.length > 5 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">+{font.sizes.length - 5}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spacing Tab */}
      {activeTab === "spacing" && (
        <div className="space-y-6">
          {/* Spacing Variables */}
          {spacingVars.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Spacing & Radius Variables ({spacingVars.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {spacingVars.map((sv) => (
                  <div
                    key={sv.key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Box className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sv.key}</p>
                      <p className="text-xs text-muted-foreground truncate">{sv.value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sv.value, sv.key)}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    >
                      {copiedVar === sv.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Border Radii */}
          {borderRadii.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Border Radii ({borderRadii.length})</h3>
              <div className="flex flex-wrap gap-3">
                {borderRadii.map((br, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="w-10 h-10 bg-primary" style={{ borderRadius: br }} />
                    <span className="text-sm font-mono">{br}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shadows */}
          {shadows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Shadows ({shadows.length})</h3>
              <div className="space-y-2">
                {shadows.map((shadow, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="w-12 h-12 rounded-lg bg-background border border-border" style={{ boxShadow: shadow }} />
                    <p className="text-xs font-mono flex-1 truncate">{shadow}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spacing Values */}
          {spacings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Computed Spacings ({spacings.length})</h3>
              <div className="flex flex-wrap gap-2">
                {spacings.map((sp, i) => (
                  <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-muted">{sp}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

