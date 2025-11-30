"use client";

import { useState, useEffect } from "react";
import { Palette, Type, Layers, Eye, Code, BarChart3, Pipette, Database } from "lucide-react";
import { ColorPalette } from "./ColorPalette";
import { ColorEditor } from "./ColorEditor";
import { TypographyDisplay } from "./TypographyDisplay";
import { StylesDisplay } from "./StylesDisplay";
import { InteractivePreview } from "./InteractivePreview";
import { CodeOutput } from "./CodeOutput";
import { AnalyticsDisplay } from "./AnalyticsDisplay";
import { SourceDataDisplay } from "./SourceDataDisplay";
import type { DesignSystem } from "@/types/design-system";
import type { ImageAnalysisResult } from "@/lib/image-analyzer";

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

interface ResultsTabsProps {
  designSystem: DesignSystem;
  imageAnalysis?: ImageAnalysisResult | null;
  extractedData?: ExtractedData | null;
  onDesignSystemChange?: (ds: DesignSystem) => void;
}

type TabId = "colors" | "edit" | "typography" | "styles" | "preview" | "code" | "analytics" | "source";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "colors", label: "Colors", icon: <Palette className="w-4 h-4" /> },
  { id: "edit", label: "Edit", icon: <Pipette className="w-4 h-4" /> },
  { id: "source", label: "Source", icon: <Database className="w-4 h-4" /> },
  { id: "typography", label: "Typography", icon: <Type className="w-4 h-4" /> },
  { id: "styles", label: "Styles", icon: <Layers className="w-4 h-4" /> },
  { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
  { id: "code", label: "Code", icon: <Code className="w-4 h-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

export function ResultsTabs({ designSystem, imageAnalysis, extractedData, onDesignSystemChange }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("colors");
  const [editedDesignSystem, setEditedDesignSystem] = useState(designSystem);

  // Update editedDesignSystem when designSystem prop changes
  useEffect(() => {
    setEditedDesignSystem(designSystem);
  }, [designSystem]);

  const handleColorsChange = (colors: typeof designSystem.colors) => {
    const updated = { ...editedDesignSystem, colors };
    setEditedDesignSystem(updated);
    onDesignSystemChange?.(updated);
  };

  const handleDesignSystemUpdate = (ds: DesignSystem) => {
    setEditedDesignSystem(ds);
    onDesignSystemChange?.(ds);
  };

  const currentDesignSystem = editedDesignSystem;

  const availableTabs = tabs.filter(tab => {
    if (tab.id === "analytics" && !imageAnalysis) return false;
    if (tab.id === "source" && !extractedData) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "colors" && (
          <ColorPalette colors={currentDesignSystem.colors} gradients={currentDesignSystem.gradients} />
        )}
        {activeTab === "edit" && (
          <ColorEditor colors={currentDesignSystem.colors} onChange={handleColorsChange} />
        )}
        {activeTab === "source" && (
          <SourceDataDisplay 
            extractedData={extractedData} 
            designSystem={currentDesignSystem}
            onDesignSystemChange={handleDesignSystemUpdate}
          />
        )}
        {activeTab === "typography" && (
          <TypographyDisplay typography={currentDesignSystem.typography} />
        )}
        {activeTab === "styles" && <StylesDisplay styles={currentDesignSystem.styles} />}
        {activeTab === "preview" && <InteractivePreview designSystem={currentDesignSystem} />}
        {activeTab === "code" && <CodeOutput designSystem={currentDesignSystem} />}
        {activeTab === "analytics" && imageAnalysis && (
          <AnalyticsDisplay analysis={imageAnalysis} />
        )}
      </div>
    </div>
  );
}
