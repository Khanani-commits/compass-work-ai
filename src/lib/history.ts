import { useCallback, useEffect, useState } from "react";
import type { HistoryItem, HistoryKind } from "./workpilot-types";

const KEY = "workpilot.history.v1";
const EVENT = "workpilot-history-change";

export function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 60)));
  window.dispatchEvent(new Event(EVENT));
}

export function saveHistory(kind: HistoryKind, title: string, payload: HistoryItem["payload"]) {
  if (typeof window === "undefined") return;
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    title: title || "Untitled",
    createdAt: Date.now(),
    payload,
  };
  write([item, ...readHistory()]);
}

export function deleteHistory(id: string) {
  write(readHistory().filter((i) => i.id !== id));
}

export function clearHistory() {
  write([]);
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const sync = useCallback(() => setItems(readHistory()), []);
  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);
  return items;
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
