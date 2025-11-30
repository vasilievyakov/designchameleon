"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Globe, ArrowRight } from "lucide-react";

interface UploadZoneProps {
  onImageSelected: (file: File, preview: string) => void;
  onUrlSubmit?: (url: string) => void;
  isAnalyzing: boolean;
  analysisMode?: "image" | "url";
}

export function UploadZone({ 
  onImageSelected, 
  onUrlSubmit,
  isAnalyzing,
  analysisMode = "image"
}: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"image" | "url">("image");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setPreview(result);
          setFileName(file.name);
          onImageSelected(file, result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isAnalyzing || mode === "url",
  });

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    
    if (!urlInput.trim()) {
      setUrlError("Please enter a URL");
      return;
    }

    // Add https if missing
    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Validate URL
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    onUrlSubmit?.(url);
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setMode("image")}
          disabled={isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${mode === "image" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
            }
            ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
        <button
          onClick={() => setMode("url")}
          disabled={isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${mode === "url" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
            }
            ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Globe className="w-4 h-4" />
          Analyze URL
        </button>
      </div>

      {/* Image Upload Mode */}
      {mode === "image" && (
        <div
          {...getRootProps()}
          className={`
            relative border border-dashed rounded-lg transition-colors cursor-pointer
            ${isDragActive ? "border-foreground bg-muted" : "border-border hover:border-muted-foreground"}
            ${isAnalyzing ? "pointer-events-none opacity-60" : ""}
            ${preview ? "p-2" : "p-10"}
          `}
        >
          <input {...getInputProps()} />

          {preview ? (
            <div className="relative">
              <div className="aspect-video max-h-[360px] w-full rounded overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                {!isAnalyzing && (
                  <button
                    onClick={clearPreview}
                    className="absolute top-2 right-2 p-1.5 rounded bg-background/80 hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isAnalyzing && analysisMode === "image" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Analyzing image...</span>
                    </div>
                  </div>
                )}
              </div>
              {fileName && (
                <p className="mt-2 text-xs text-muted-foreground truncate">
                  {fileName}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1">
                  {isDragActive ? "Drop image here" : "Drop an image or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Input Mode */}
      {mode === "url" && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Globe className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError(null);
              }}
              placeholder="Enter website URL (e.g., stripe.com)"
              disabled={isAnalyzing}
              className={`
                w-full pl-12 pr-4 py-4 rounded-lg border bg-background text-foreground
                placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-foreground/20
                disabled:opacity-50 disabled:cursor-not-allowed
                ${urlError ? "border-red-500" : "border-border"}
              `}
            />
          </div>
          
          {urlError && (
            <p className="text-sm text-red-500">{urlError}</p>
          )}

          <button
            type="submit"
            disabled={isAnalyzing || !urlInput.trim()}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-foreground text-background font-medium
              hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isAnalyzing && analysisMode === "url" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting styles...
              </>
            ) : (
              <>
                Extract Design System
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="text-sm font-medium mb-2">How it works</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• We load the website in a headless browser</li>
              <li>• Extract CSS variables, computed styles, fonts</li>
              <li>• Analyze colors, spacing, shadows, border-radius</li>
              <li>• Generate a complete design system</li>
            </ul>
            <p className="text-xs text-amber-500/80 mt-3">
              Note: URL analysis may not work on the demo. Use Image Upload for best results.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
