"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Clock } from "lucide-react";
import { getHistory, removeFromHistory, clearHistory, type HistoryEntry } from "@/lib/history";
import type { DesignSystem } from "@/types/design-system";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (designSystem: DesignSystem, thumbnail: string | null) => void;
}

export function HistoryPanel({ isOpen, onClose, onSelect }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (confirm("Clear all history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <span className="text-sm font-medium">History</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    onSelect(entry.designSystem, entry.thumbnail);
                    onClose();
                  }}
                  className="w-full p-3 rounded-md border border-border hover:border-muted-foreground transition-colors text-left group"
                >
                  <div className="flex gap-3">
                    {entry.thumbnail ? (
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={entry.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex-shrink-0 grid grid-cols-2">
                        <div style={{ backgroundColor: entry.designSystem.colors.primary }} />
                        <div style={{ backgroundColor: entry.designSystem.colors.secondary }} />
                        <div style={{ backgroundColor: entry.designSystem.colors.accent }} />
                        <div style={{ backgroundColor: entry.designSystem.colors.background }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {entry.designSystem.name}
                        </p>
                        <button
                          onClick={(e) => handleRemove(entry.id, e)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-border">
            <button
              onClick={handleClearAll}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
