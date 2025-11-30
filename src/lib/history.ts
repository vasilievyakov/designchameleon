import type { DesignSystem } from "@/types/design-system";

export interface HistoryEntry {
  id: string;
  designSystem: DesignSystem;
  thumbnail: string | null;
  createdAt: string;
}

const HISTORY_KEY = "design-chameleon-history";
const MAX_HISTORY = 20;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(
  designSystem: DesignSystem,
  thumbnail: string | null
): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    designSystem,
    thumbnail,
    createdAt: new Date().toISOString(),
  };

  const history = getHistory();
  const updated = [entry, ...history].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Storage full, remove oldest entries
    const trimmed = updated.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  return entry;
}

export function removeFromHistory(id: string): void {
  const history = getHistory();
  const updated = history.filter((entry) => entry.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  const history = getHistory();
  return history.find((entry) => entry.id === id) || null;
}

