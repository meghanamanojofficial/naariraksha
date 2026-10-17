"use client";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Bot, ChevronDown, ClipboardCheck, FileText, FolderOpen, Gavel, ListChecks, Lock, Phone, Send, ShieldCheck, Siren, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SpeakButton from "@/components/SpeakButton";
import VoiceInput from "@/components/VoiceInput";
import { AuthorityItem, Bullets, Card, LawItem, LegalAidItem } from "@/components/ui";
import { chat, getMeta, type ChatResult, type Intake, type Msg } from "@/lib/api";
import { useLanguage, type Language } from "@/lib/language";

const RELATIONS = ["", "Stranger", "Husband / partner", "Family member", "Colleague / boss", "Teacher", "Someone online", "Friend / acquaintance"];
const STARTERS: Record<Language, string[]> = {
  English: ["Someone is threatening to leak my photos", "My husband hits me", "A man keeps following me", "My boss makes comments about my body"],
  Malayalam: ["എന്റെ ഫോട്ടോകൾ പുറത്തുവിടുമെന്ന് ഒരാൾ ഭീഷണിപ്പെടുത്തുന്നു", "എന്റെ ഭർത്താവ് എന്നെ ഉപദ്രവിക്കുന്നു", "ഒരാൾ എന്നെ പിന്തുടരുന്നു"],
};

export default function HelpPage() {
  const { language, setLanguage } = useLanguage();
  const [districts, setDistricts] = useState<string[]>([]);
  const [intake, setIntake] = useState<Intake>({ is_minor: false, in_danger: false });
  const [showIntake, setShowIntake] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [result, setResult] = useState<ChatResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getMeta().then((m) => setDistricts(m.districts)).catch(() => {}); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (text.length < 3 || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setBusy(true); setErr("");
    try {
      const r = await chat(next, intake, language);
      setMessages([...next, { role: "assistant", content: r.reply }]);
      setResult(r);
      try {
        sessionStorage.setItem("nr_case", JSON.stringify({
          description: next.filter((m) => m.role === "user").map((m) => m.content).join("\n"),
          crime_slug: r.crimes[0]?.slug, incident_date: intake.incident_date,
          authority_type: r.recommended_authority || undefined,
        }));
      } catch {}
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
    setBusy(false);
  };

  const clear = () => {
    setMessages([]); setResult(null); setInput(""); setInterim(""); setErr("");
    try { sessionStorage.removeItem("nr_case"); } catch {}
  };

  const set = (patch: Partial<Intake>) => setIntake((p) => ({ ...p, ...patch }));
  const keyLaws = result?.laws.filter((l) => l.key) || [];
  const otherLaws = result?.laws.filter((l) => !l.key) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link href="/" className="flex items-center gap-1 text-ink-soft hover:text-primary-container"><ArrowLeft size={14} /> Back home</Link>
        <div className="flex flex-wrap gap-2">
          <span className="chip"><span className="h-1.5 w-1.5 rounded-full bg-primary-container" /> Private session</span>
          <span className="chip-info chip"><Lock size={11} /> Nothing you type is stored</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="eyebrow">Kerala · Updated for BNS / BNSS / BSA 2023</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tell us what happened</h1>
        <p className="max-w-2xl text-ink-soft">Private, trauma-informed guidance. Your conversation stays in this tab and is gone when you close it.</p>
      </div>

      {/* Intake */}
      <section className="glass overflow-hidden">
        <button onClick={() => setShowIntake((s) => !s)} aria-expanded={showIntake}
          className="flex w-full items-center justify-between gap-3 p-5 text-left">
          <span className="flex items-start gap-3">
            <span className="icon-badge"><SlidersHorizontal size={18} /></span>
            <span>
              <span className="block font-semibold text-ink">A few quick details <span className="text-xs font-normal text-primary-container">(optional, but they change the advice)</span></span>
              <span className="text-xs text-ink-muted">The date decides which law applies; the district decides who to contact.</span>
            </span>
          </span>
          <ChevronDown size={20} className={`shrink-0 text-ink-muted transition ${showIntake ? "rotate-180" : ""}`} />
        </button>
        {showIntake && (
          <div className="space-y-4 px-5 pb-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label>
                <span className="label">When did it happen?</span>
                <input type="date" className="field" value={intake.incident_date || ""}
                  onChange={(e) => set({ incident_date: e.target.value || undefined })} />
              </label>
              <label>
                <span className="label">District (Kerala)</span>
                <select className="field" value={intake.district || ""} onChange={(e) => set({ district: e.target.value || undefined })}>
                  <option value="">Select</option>
                  {districts.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label>
                <span className="label">Who is the person?</span>
                <select className="field" value={intake.relation_to_accused || ""} onChange={(e) => set({ relation_to_accused: e.target.value || undefined })}>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r || "Select"}</option>)}
                </select>
              </label>
              <label>
                <span className="label">Reply language</span>
                <select className="field" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                  <option>English</option><option>Malayalam</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="check" checked={intake.is_minor} onChange={(e) => set({ is_minor: e.target.checked })} /> She is under 18 (POCSO applies)</label>
              <label className="flex items-center gap-2 text-red-700"><input type="checkbox" className="check" checked={intake.in_danger} onChange={(e) => set({ in_danger: e.target.checked })} /> I am in danger right now</label>
            </div>
          </div>
        )}
        {intake.in_danger && (
          <div className="m-5 mt-0 flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-red-700 to-red-600 p-4 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"><Siren size={20} /></span>
              <div>
                <p className="font-bold">If you can do so safely, call 112 now</p>
                <p className="text-xs text-white/85">Police, fire and ambulance. Works anywhere in India.</p>
              </div>
            </div>
            <a href="tel:112" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-red-700"><Phone size={16} /> Call 112</a>
          </div>
        )}
      </section>

      {/* Chat */}
      <section className="glass p-5 sm:p-6">
        {messages.length === 0 && (
          <div className="mb-4">
            <p className="eyebrow mb-2 text-secondary">Suggested starting points</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS[language].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-full bg-primary-fixed/60 px-3 py-1.5 text-xs text-on-primary-fixed-variant transition hover:bg-primary-fixed">
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary-container"><Bot size={16} /></span>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-3 text-sm text-ink">
              Write it the way you would tell a friend. You do not need legal words. I&apos;ll explain the laws that apply and what you can do. What you do next is your choice.
            </div>
          </div>
          {messages.map((m, i) => m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary-container px-4 py-3 text-sm text-white shadow-[0_6px_16px_-8px_rgba(190,18,60,0.6)]">
              {m.content}
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-white"><Bot size={16} /></span>
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-white bg-surface-container-low px-4 py-3 text-sm text-ink">
                {m.content}
                <div><SpeakButton text={m.content} language={language} /></div>
              </div>
            </div>
          ))}
          {busy && (
            <p className="flex items-center gap-2 pl-11 text-xs text-primary-container">
              <span className="flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-container" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-container [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-container [animation-delay:300ms]" /></span>
              Checking our legal library…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {result && !busy && (result.offline || result.follow_up_questions.length > 0) && (
          <div className="mt-4 space-y-3">
            {result.offline && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="chip-warn chip"><AlertTriangle size={12} /> Offline mode: basic guidance only</span>
                <span className="text-ink-muted">Reason: {result.offline_reason || "AI unavailable"}</span>
              </div>
            )}
            {result.follow_up_questions.length > 0 && (
              <div className="rounded-2xl bg-white/70 p-4 text-sm">
                <p className="eyebrow mb-2 text-secondary">It would help to know</p>
                <ul className="space-y-1">{result.follow_up_questions.map((q, i) => <li key={i} className="flex gap-2"><span className="text-primary-container">•</span>{q}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-rose-100 bg-surface-container-low/80 p-3 focus-within:border-primary-container focus-within:shadow-[0_0_0_3px_rgba(190,18,60,0.15)]">
          <textarea value={interim ? (input ? input.trimEnd() + " " : "") + interim : input}
            onChange={(e) => { setInterim(""); setInput(e.target.value); }} rows={3}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={language === "Malayalam" ? "എന്താണ് സംഭവിച്ചതെന്ന് എഴുതുക അല്ലെങ്കിൽ 🎤 അമർത്തി പറയുക…" : "Write it the way you would tell a friend, or tap the mic and speak… (Enter to send)"}
            className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <VoiceInput language={language} disabled={busy}
                onText={(t) => setInput((p) => (p ? p.trimEnd() + " " : "") + t)}
                onInterim={setInterim} />
              <span className="hidden text-xs text-primary-container sm:inline">Audio is never stored</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && <button onClick={clear} className="px-2 text-xs font-medium text-ink-soft hover:text-primary-container">Clear</button>}
              <button onClick={send} disabled={busy || input.trim().length < 3} className="btn-primary !min-h-10 !rounded-full">Send <Send size={14} /></button>
            </div>
          </div>
        </div>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </section>

      {/* Results */}
      {result && result.crimes.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><span className="h-2 w-2 rounded-full bg-primary-container" /> Legal breakdown based on your situation</h2>
            <div className="flex flex-wrap gap-2">
              {result.crimes.map((c) => (
                <Link key={c.slug} href={`/crimes/${c.slug}`} className="chip !py-1 !text-xs hover:!bg-primary-fixed"># {c.name}</Link>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {result.next_steps.length > 0 && (
              <Card title="What to do next" icon={ListChecks}><Bullets items={result.next_steps} /></Card>
            )}
            <Card title="Laws that may apply" icon={BookOpen} className={result.next_steps.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="grid gap-3 md:grid-cols-2">{keyLaws.map((l) => <LawItem key={l.code} law={l} />)}</div>
              {otherLaws.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-primary-container">Other laws that may also apply ({otherLaws.length})</summary>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">{otherLaws.map((l) => <LawItem key={l.code} law={l} />)}</div>
                </details>
              )}
              <p className="mt-4 flex items-start gap-1.5 text-xs text-ink-muted">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                From our verified legal library, not generated by AI. Based on the incident date: BNS/BNSS/BSA apply from 1 July 2024; IPC/CrPC/Evidence Act before that.
              </p>
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card title="Evidence to keep" icon={FolderOpen} subtitle="Don't delete chats or photos"><Bullets items={result.evidence} /></Card>
            <Card title="Documents to carry" icon={ClipboardCheck} subtitle="To the police station or office"><Bullets items={result.documents} /></Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title={`Who can help${intake.district ? ` in ${intake.district}` : ""}`} icon={Users}
              badge={intake.district ? <span className="chip">District</span> : undefined}>
              <ul className="space-y-3">{result.authorities.map((a) => <AuthorityItem key={a.id} a={a} />)}</ul>
              <Link href="/directory" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-container">All helplines <ArrowRight size={14} /></Link>
            </Card>
            <Card title="Free legal aid" icon={Gavel} badge={<span className="chip">Free for every woman</span>}>
              <p className="mb-3 text-sm text-ink-soft">Under the Legal Services Authorities Act, every woman is entitled to a <b className="text-primary-container">free lawyer</b>, whatever her income.</p>
              <ul className="space-y-3">{result.legal_aid.map((x) => <LegalAidItem key={x.id} x={x} />)}</ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/complaint" className="btn-primary"><FileText size={16} /> Draft a formal complaint <ArrowRight size={16} /></Link>
                <Link href="/legal-aid" className="btn-glass">Request a callback</Link>
              </div>
            </Card>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-ink-muted">
        Need to close immediately? Tap <b>Quick exit</b> at the top or press <b>Esc</b> twice.
      </p>
    </div>
  );
}
