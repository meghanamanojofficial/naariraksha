"use client";
import { useEffect } from "react";

// Leaves instantly and replaces history so "Back" doesn't return. Shortcut: Esc twice.
const SAFE_URL = "https://www.google.com/search?q=weather+today";

export function quickExit() {
  try { sessionStorage.clear(); } catch {}
  window.location.replace(SAFE_URL);
}

export default function QuickExit() {
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
      className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-black">
      Quick exit ✕
    </button>
  );
}
