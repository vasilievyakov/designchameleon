"use client";

import { History, Github } from "lucide-react";

interface HeaderProps {
  onHistoryClick?: () => void;
  historyCount?: number;
}

export function Header({ onHistoryClick, historyCount = 0 }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold">DC</span>
          </div>
          <span className="text-sm font-medium">Design Chameleon</span>
        </div>

        <div className="flex items-center gap-1">
          {onHistoryClick && (
            <button
              onClick={onHistoryClick}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({historyCount})
                </span>
              )}
            </button>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
