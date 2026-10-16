"use client";
import { AlertTriangle, Copy, FileDown, FileText, Landmark, Lock, Printer, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { downloadDocx, draftComplaint, getCrimes, type ComplaintIn, type CrimeSummary } from "@/lib/api";
import { useLanguage } from "@/lib/language";

const AUTHORITIES = [
  { value: "police", label: "Police (FIR / complaint)" },
  { value: "magistrate", label: "Magistrate (if police refuse)" },
  { value: "protection_officer", label: "Protection Officer (domestic violence)" },
  { value: "posh_committee", label: "Internal Committee (workplace / college)" },
  { value: "cyber", label: "Cyber crime cell / portal" },
];

const FIELDS: { key: keyof ComplaintIn; label: string; placeholder: string; type?: string; area?: boolean }[] = [
  { key: "name", label: "Your name", placeholder: "Leave blank to fill in later" },
  { key: "address", label: "Your address", placeholder: "House, locality, district, PIN" },
  { key: "incident_date", label: "Date of incident", placeholder: "", type: "date" },
  { key: "incident_place", label: "Place of incident", placeholder: "Address, landmark, or the app / website" },
  { key: "accused", label: "Person(s) responsible", placeholder: "Name, relation or description" },
  { key: "witnesses", label: "Witnesses", placeholder: "Names of people who saw or know" },
  { key: "description", label: "What happened (required)", placeholder: "In order, as clearly as you can. Include threats, dates and how it affected you.", area: true },
  { key: "evidence", label: "Evidence you have", placeholder: "e.g. screenshots, chat exports, medical report, photos, call logs", area: true },
];

export default function ComplaintPage() {
  const { language } = useLanguage();
  const [crimes, setCrimes] = useState<CrimeSummary[]>([]);
  const [form, setForm] = useState<ComplaintIn>({ authority_type: "police", language, description: "" });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCrimes().then(setCrimes).catch(() => {});
    try {
      const saved = JSON.parse(sessionStorage.getItem("nr_case") || "null");
      if (saved) setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(saved).filter(([, v]) => v)) }));
    } catch {}
  }, []);
  useEffect(() => { setForm((f) => ({ ...f, language })); }, [language]);

  const set = (k: keyof ComplaintIn, v: string) => setForm((f) => ({ ...f, [k]: v || undefined }));

  const generate = async () => {
    setBusy(true); setErr("");
    try { setText((await draftComplaint(form)).text); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const placeholders = (text.match(/\[[^\]\n]+\]/g) || []).length;

  return (
    <div className="space-y-6">
      <section className="glass relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary-container" />
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="eyebrow"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-container text-white"><FileText size={13} /></span> Complaint assistant</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Draft a formal complaint</h1>
            <p className="max-w-2xl text-ink-soft">
              Fill what you can. Anything missing becomes an editable <span className="rounded bg-primary-fixed px-1.5 font-mono text-xs text-primary">[PLACEHOLDER]</span>. Nothing is stored.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
            <span className="chip-info chip"><Lock size={11} /> Private &amp; unsaved</span>
            <span className="chip-info chip"><ShieldCheck size={11} /> Citations from our legal library</span>
            <span className="chip-info chip"><Landmark size={11} /> Police · Magistrate · PO · IC · Cyber</span>
          </div>
        </div>
      </section>

      <section className="glass p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="icon-badge"><Wand2 size={18} /></span>
            <div>
              <h2 className="font-semibold">Step 1: Incident &amp; authority</h2>
              <p className="text-xs text-ink-muted">Details you gave in Get help are filled in for you.</p>
            </div>
          </div>
          <div className="flex rounded-full bg-surface-container p-1 text-xs font-semibold">
            {(["English", "Malayalam"] as const).map((l) => (
              <button key={l} type="button" onClick={() => set("language", l)}
                className={`rounded-full px-3 py-1.5 transition ${form.language === l ? "bg-primary-container text-white" : "text-ink-soft"}`}>
                Draft in {l === "Malayalam" ? "Malayalam (മലയാളം)" : "English"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Send to</span>
            <select className="field" value={form.authority_type} onChange={(e) => set("authority_type", e.target.value)}>
              {AUTHORITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Type of incident</span>
            <select className="field" value={form.crime_slug || ""} onChange={(e) => set("crime_slug", e.target.value)}>
              <option value="">Select</option>
              {crimes.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          {FIELDS.map((f) => (
            <label key={f.key} className={f.area ? "sm:col-span-2" : ""}>
              <span className="label">{f.label}</span>
              {f.area
                ? <textarea rows={4} className="field" placeholder={f.placeholder} value={(form[f.key] as string) || ""} onChange={(e) => set(f.key, e.target.value)} />
                : <input type={f.type || "text"} className="field" placeholder={f.placeholder} value={(form[f.key] as string) || ""} onChange={(e) => set(f.key, e.target.value)} />}
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted"><Lock size={12} /> Nothing is saved. Closing the tab clears it.</p>
          <button onClick={generate} disabled={busy || form.description.length < 10} className="btn-primary !min-h-12 !px-6">
            {busy ? "Drafting…" : <>Generate complaint <Sparkles size={16} /></>}
          </button>
        </div>
        {form.description.length > 0 && form.description.length < 10 && <p className="mt-2 text-right text-xs text-ink-muted">Write at least a sentence about what happened.</p>}
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </section>

      {text && (
        <section className="glass p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="icon-badge"><FileText size={18} /></span>
              <div>
                <h2 className="font-semibold">Your complaint (edit freely)</h2>
                <p className="text-xs text-primary-container">
                  {placeholders > 0 ? `${placeholders} placeholder${placeholders === 1 ? "" : "s"} in [BRACKETS] left to fill in` : "No placeholders left"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copy} className="btn-glass !min-h-10"><Copy size={15} /> {copied ? "Copied" : "Copy"}</button>
              <button onClick={() => downloadDocx(text).catch((e) => setErr(String(e)))} className="btn-glass !min-h-10"><FileDown size={15} /> Word (.docx)</button>
              <button onClick={() => window.print()} className="btn-primary !min-h-10"><Printer size={15} /> Print / PDF</button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-inner sm:p-6">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={24} aria-label="Complaint text"
              className="w-full resize-y bg-transparent p-2 font-serif text-[15px] leading-7 text-slate-800 outline-none" />
          </div>
          <div className="mt-4 flex gap-2 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800">
            <AlertTriangle size={16} className="shrink-0" />
            <p><b>Before you submit:</b> review every line and replace every [PLACEHOLDER]. Take two copies; ask for a signed acknowledgement or a free copy of the FIR.</p>
          </div>
          <div className="print-only">{text}</div>
        </section>
      )}
    </div>
  );
}
