"use client";
import { useEffect, useRef, useState } from "react";
import { API } from "@/lib/api";

/**
 * Mic button for the chat box.
 *  - Mode "live": browser speech recognition (Chrome / Edge / Android Chrome). Words appear as she speaks.
 *  - Mode "record": records audio and sends it to /api/transcribe (Gemini). Used on Firefox / Safari,
 *    or automatically if live recognition fails (e.g. network blocked).
 * Nothing is stored: audio is only kept in memory until it's transcribed.
 */

const LANG_CODES: Record<string, string> = { English: "en-IN", Malayalam: "ml-IN" };
const MAX_RECORD_SECONDS = 120;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

function getRecognitionCtor(): AnyRecognition | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

type Props = {
  language: string;                 // "English" | "Malayalam"
  onText: (text: string) => void;   // final text to append to the input
  onInterim?: (text: string) => void; // live partial text (shown as a preview)
  disabled?: boolean;
};

export default function VoiceInput({ language, onText, onInterim, disabled }: Props) {
  const [state, setState] = useState<"idle" | "listening" | "recording" | "transcribing">("idle");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<AnyRecognition>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supportsLive = useRef(false);
  const supportsRecord = useRef(false);

  useEffect(() => {
    supportsLive.current = !!getRecognitionCtor();
    supportsRecord.current = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; };
  const startTimer = () => {
    setSeconds(0);
    clearTimer();
    timerRef.current = setInterval(() => setSeconds((s) => {
      if (s + 1 >= MAX_RECORD_SECONDS) stopAll();
      return s + 1;
    }), 1000);
  };

  function stopAll() {
    try { recRef.current?.stop(); } catch {}
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    clearTimer();
  }

  // ---------- live mode ----------
  const startLive = () => {
    const Ctor = getRecognitionCtor();
    const rec = new Ctor();
    rec.lang = LANG_CODES[language] || "en-IN";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    let gotAnything = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { gotAnything = true; onText(t.trim()); }
        else interim += t;
      }
      onInterim?.(interim);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access is blocked. Allow it in the browser's address bar, or type instead.");
      } else if ((e.error === "network" || e.error === "language-not-supported") && supportsRecord.current && !gotAnything) {
        // Live service unavailable: switch to record-and-transcribe silently.
        recRef.current = null;
        startRecord();
        return;
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Voice input error (${e.error}). You can type instead.`);
      }
    };
    rec.onend = () => {
      onInterim?.("");
      clearTimer();
      setState((s) => (s === "listening" ? "idle" : s));
    };
    recRef.current = rec;
    rec.start();
    setState("listening");
    startTimer();
  };

  // ---------- record mode ----------
  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearTimer();
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size < 1000) { setState("idle"); return; }
        setState("transcribing");
        try {
          const fd = new FormData();
          fd.append("audio", blob, "voice." + (blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm"));
          fd.append("language", language);
          const res = await fetch(`${API}/api/transcribe`, { method: "POST", body: fd });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(body.detail || "Transcription failed");
          if (body.text) onText(body.text);
          else setError("I couldn't hear any words. Please try again, closer to the mic.");
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
        setState("idle");
      };
      mediaRef.current = mr;
      mr.start();
      setState("recording");
      startTimer();
    } catch {
      setError("Microphone access is blocked or unavailable. Allow it in the browser, or type instead.");
      setState("idle");
    }
  };

  const toggle = () => {
    setError("");
    if (state === "listening" || state === "recording") { stopAll(); if (state === "listening") setState("idle"); return; }
    if (state === "transcribing") return;
    if (supportsLive.current) startLive();
    else if (supportsRecord.current) startRecord();
    else setError("Voice input isn't supported in this browser. Please type instead.");
  };

  const active = state === "listening" || state === "recording";
  const label =
    state === "listening" ? `Listening… ${seconds}s (tap to stop)` :
    state === "recording" ? `Recording… ${seconds}s (tap to stop)` :
    state === "transcribing" ? "Transcribing…" : `Speak (${language})`;

  return (
    <div className="flex flex-col items-stretch">
      <button type="button" onClick={toggle} disabled={disabled || state === "transcribing"}
        aria-pressed={active} aria-label={active ? "Stop voice input" : `Start voice input in ${language}`}
        title={active ? "Stop" : "Speak instead of typing"}
        className={`flex h-full min-h-[3rem] items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition disabled:opacity-50
          ${active ? "border-rose-700 bg-rose-700 text-white" : "border-rose-200 bg-white text-rose-800 hover:bg-rose-50"}`}>
        {active ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> : <MicIcon />}
        <span className="hidden sm:inline">{label}</span>
      </button>
      {error && <p role="alert" className="mt-1 max-w-xs text-xs text-red-600">{error}</p>}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
    </svg>
  );
}
