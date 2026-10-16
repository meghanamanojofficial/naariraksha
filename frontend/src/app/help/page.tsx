"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthorityItem, Bullets, Card, LawItem, LegalAidItem } from "@/components/ui";
import { chat, getMeta, type ChatResult, type Intake, type Msg } from "@/lib/api";

const RELATIONS = ["", "Stranger", "Husband / partner", "Family member", "Colleague / boss", "Teacher", "Someone online", "Friend / acquaintance"];

export default function HelpPage() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [intake, setIntake] = useState<Intake>({ is_minor: false, in_danger: false });
  const [language, setLanguage] = useState("English");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ChatResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getMeta().then((m) => setDistricts(m.districts)).catch(() => {}); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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

  const set = (patch: Partial<Intake>) => setIntake((p) => ({ ...p, ...patch }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rose-800">Tell us what happened</h1>

      <Card title="A few quick details (optional, but they change the advice)">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1">
            <span className="block text-slate-600">When did it happen?</span>
            <input type="date" className="w-full rounded border px-2 py-1.5" value={intake.incident_date || ""}
              onChange={(e) => set({ incident_date: e.target.value || undefined })} />
          </label>
          <label className="space-y-1">
            <span className="block text-slate-600">District (Kerala)</span>
            <select className="w-full rounded border px-2 py-1.5" value={intake.district || ""} onChange={(e) => set({ district: e.target.value || undefined })}>
              <option value="">Select</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-slate-600">Who is the person?</span>
            <select className="w-full rounded border px-2 py-1.5" value={intake.relation_to_accused || ""} onChange={(e) => set({ relation_to_accused: e.target.value || undefined })}>
              {RELATIONS.map((r) => <option key={r} value={r}>{r || "Select"}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={intake.is_minor} onChange={(e) => set({ is_minor: e.target.checked })} /> She is under 18</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={intake.in_danger} onChange={(e) => set({ in_danger: e.target.checked })} /> I am in danger right now</label>
          <label className="flex items-center gap-2">Language
            <select className="rounded border px-2 py-1" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option><option>Malayalam</option>
            </select>
          </label>
        </div>
      </Card>

      {intake.in_danger && (
        <div className="rounded-xl bg-red-600 p-4 font-semibold text-white">
          If you can do so safely, call <a href="tel:112" className="underline">112</a> now.
        </div>
      )}

      <Card>
        <div className="max-h-[28rem] space-y-3 overflow-y-auto">
          {messages.length === 0 && <p className="text-sm text-slate-500">Write it the way you would tell a friend. You do not need legal words. Nothing you type is stored.</p>}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "ml-auto bg-rose-700 text-white" : "bg-rose-50"}`}>
              {m.content}
            </div>
          ))}
          {busy && <p className="text-sm text-slate-500">Thinking…</p>}
          <div ref={endRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="e.g. My husband hits me and his family keeps asking for more dowry…"
            className="flex-1 rounded-xl border border-rose-200 p-3 text-sm outline-none focus:ring-2 focus:ring-rose-300" />
          <button onClick={send} disabled={busy || input.trim().length < 3}
            className="rounded-xl bg-rose-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Send</button>
        </div>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        {result && result.follow_up_questions.length > 0 && !busy && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">It would help to know</p>
            <ul className="list-disc space-y-0.5 pl-5">{result.follow_up_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </div>
        )}
        {result?.offline && (
          <p className="mt-2 text-xs text-amber-700">
            Offline mode: basic guidance only. Reason: {result.offline_reason || "AI unavailable"}
          </p>
        )}
      </Card>

      {result && result.crimes.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {result.crimes.map((c) => (
              <Link key={c.slug} href={`/crimes/${c.slug}`} className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-800 hover:bg-rose-200">{c.name}</Link>
            ))}
          </div>
          {result.next_steps.length > 0 && <Card title="What to do next"><Bullets items={result.next_steps} /></Card>}
          <Card title="Laws that may apply">
            <div className="space-y-3">{result.laws.filter((l) => l.key).map((l) => <LawItem key={l.code} law={l} />)}</div>
            {result.laws.some((l) => !l.key) && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-rose-700">Other laws that may also apply ({result.laws.filter((l) => !l.key).length})</summary>
                <div className="mt-3 space-y-3">{result.laws.filter((l) => !l.key).map((l) => <LawItem key={l.code} law={l} />)}</div>
              </details>
            )}
            <p className="mt-3 text-xs text-slate-500">✓ From our verified legal library, not generated by AI. Based on the incident date: BNS/BNSS/BSA apply from 1 July 2024; IPC/CrPC/Evidence Act before that.</p>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Evidence to keep"><Bullets items={result.evidence} /></Card>
            <Card title="Documents to carry"><Bullets items={result.documents} /></Card>
          </div>
          <Card title="Who can help"><ul className="space-y-2">{result.authorities.map((a) => <AuthorityItem key={a.id} a={a} />)}</ul></Card>
          <Card title="Free legal aid">
            <ul className="space-y-2">{result.legal_aid.map((x) => <LegalAidItem key={x.id} x={x} />)}</ul>
            <Link href="/legal-aid" className="mt-2 inline-block text-sm text-rose-700 underline">Request a callback from a lawyer →</Link>
          </Card>
          <Link href="/complaint" className="inline-block rounded-lg bg-rose-700 px-5 py-2 text-sm font-semibold text-white">Draft a formal complaint →</Link>
        </div>
      )}
    </div>
  );
}
