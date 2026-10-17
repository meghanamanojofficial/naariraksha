"use client";
import { useEffect, useState } from "react";

/** Reads a reply aloud with the browser's built-in text-to-speech (no server, nothing stored). */
export default function SpeakButton({ text, language }: { text: string; language: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { try { window.speechSynthesis.cancel(); } catch {} };
  }, []);
  if (!supported) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const code = language === "Malayalam" ? "ml-IN" : "en-IN";
    u.lang = code;
    const voice = synth.getVoices().find((v) => v.lang === code) || synth.getVoices().find((v) => v.lang.startsWith(code.slice(0, 2)));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <button type="button" onClick={toggle} className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-primary-container hover:bg-white" aria-label={speaking ? "Stop reading" : "Read this aloud"}>
      {speaking ? "■ Stop" : "🔊 Read aloud"}
    </button>
  );
}
