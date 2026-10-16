"use client";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

// Leaves instantly and replaces history so "Back" doesn't return. Shortcut: Esc twice.
const SAFE_URL = "https://www.google.com/search?q=weather+today";

export function quickExit() {
  try { sessionStorage.clear(); } catch {}
  window.location.replace(SAFE_URL);
}

export default function QuickExit({ compact = false }: { compact?: boolean }) {
  useEffect(() => {
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (Date.now() - last < 600) quickExit();
      last = Date.now();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <button onClick={quickExit} title="Leave instantly (or press Esc twice)"
      className="inline-flex h-10 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full bg-inverse-surface px-4 text-sm font-semibold text-inverse-on-surface shadow-[0_2px_8px_rgba(38,49,67,0.25)] transition hover:opacity-90 active:scale-95">
      <LogOut size={16} aria-hidden />
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>Quick exit</span>
    </button>
  );
}
