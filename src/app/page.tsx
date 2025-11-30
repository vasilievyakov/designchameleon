"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ResultsTabs } from "@/components/ResultsTabs";
import { HistoryPanel } from "@/components/HistoryPanel";
import { demoDesignSystem } from "@/lib/demo-design-system";
import { saveToHistory, getHistory } from "@/lib/history";
import { analyzeImage, type ImageAnalysisResult } from "@/lib/image-analyzer";
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

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"image" | "url">("image");
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [analyzedUrl, setAnalyzedUrl] = useState<string | null>(null);

  useEffect(() => {
    setHistoryCount(getHistory().length);
  }, []);

  const handleImageSelected = useCallback(async (file: File, preview: string) => {
    setUploadedImage(preview);
    setAnalyzedUrl(null);
    setError(null);
    setIsAnalyzing(true);
    setAnalysisMode("image");
    setDesignSystem(null);
    setImageAnalysis(null);
    setExtractedData(null);

    let clientAnalysis: ImageAnalysisResult | null = null;
    try {
      clientAnalysis = await analyzeImage(preview);
    } catch (err) {
      console.warn("Client analysis failed:", err);
    }

    try {
      const apiResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      }).then(res => res.json());

      if (apiResponse.error) {
        console.warn("API error:", apiResponse.error);
        setError(apiResponse.error);
        setDesignSystem(demoDesignSystem);
        setImageAnalysis(clientAnalysis);
      } else {
        const ds = apiResponse.designSystem;
        setDesignSystem(ds);
        setImageAnalysis(clientAnalysis);
        saveToHistory(ds, preview);
        setHistoryCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Connection error");
      setDesignSystem(demoDesignSystem);
      setImageAnalysis(clientAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setAnalyzedUrl(url);
    setUploadedImage(null);
    setError(null);
    setIsAnalyzing(true);
    setAnalysisMode("url");
    setDesignSystem(null);
    setImageAnalysis(null);
    setExtractedData(null);

    try {
      const apiResponse = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }).then(res => res.json());

      if (apiResponse.error) {
        console.warn("API error:", apiResponse.error);
        setError(apiResponse.error);
      } else {
        const ds = apiResponse.designSystem;
        const screenshot = apiResponse.screenshot;
        const extracted = apiResponse.extractedData;
        setDesignSystem(ds);
        setUploadedImage(screenshot);
        setExtractedData(extracted);
        saveToHistory(ds, screenshot);
        setHistoryCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("URL analysis failed:", err);
      setError("Failed to analyze URL. Make sure the website is accessible.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleTryDemo = () => {
    setDesignSystem(demoDesignSystem);
    setUploadedImage(null);
    setImageAnalysis(null);
    setError(null);
  };

  const handleReset = () => {
    setDesignSystem(null);
    setUploadedImage(null);
    setImageAnalysis(null);
    setExtractedData(null);
    setError(null);
    setAnalyzedUrl(null);
  };

  const handleHistorySelect = (ds: DesignSystem, thumbnail: string | null) => {
    setDesignSystem(ds);
    setUploadedImage(thumbnail);
    setImageAnalysis(null);
    setError(null);
  };

  const handleDesignSystemChange = (ds: DesignSystem) => {
    setDesignSystem(ds);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onHistoryClick={() => setHistoryOpen(true)}
        historyCount={historyCount}
      />
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />

      <main className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {!designSystem ? (
            <>
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight mb-2">
                  Design System Extractor
                </h1>
                <p className="text-muted-foreground">
                  Upload a UI screenshot to extract colors, typography, and styles.
                </p>
              </div>

              {/* Upload */}
              <UploadZone
                onImageSelected={handleImageSelected}
                onUrlSubmit={handleUrlSubmit}
                isAnalyzing={isAnalyzing}
                analysisMode={analysisMode}
              />

              {error && (
                <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Demo link */}
              <div className="mt-8 pt-8 border-t border-border">
                <button
                  onClick={handleTryDemo}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  Try with demo data
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  {uploadedImage && (
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted border border-border">
                      <img
                        src={uploadedImage}
                        alt="Source"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-lg font-semibold">{designSystem.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {analyzedUrl ? (
                        <a 
                          href={analyzedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {new URL(analyzedUrl).hostname}
                        </a>
                      ) : (
                        designSystem.mood.slice(0, 3).join(" · ")
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New analysis
                </button>
              </div>

              {/* Results */}
              <ResultsTabs
                designSystem={designSystem}
                imageAnalysis={imageAnalysis}
                extractedData={extractedData}
                onDesignSystemChange={handleDesignSystemChange}
              />
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Design Chameleon</span>
            <span>Powered by Gemini AI</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Made for</span>
            <a 
              href="https://t.me/vibecod3rs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Vibecod3rs Hackathon
            </a>
            <span>·</span>
            <span>by</span>
            <a 
              href="https://t.me/nfg_ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              @nfg_ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
