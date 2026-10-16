"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { downloadDocx, draftComplaint, getCrimes, type ComplaintIn, type CrimeSummary } from "@/lib/api";

const AUTHORITIES = [
  { value: "police", label: "Police (FIR / complaint)" },
  { value: "magistrate", label: "Magistrate (if police refuse)" },
  { value: "protection_officer", label: "Protection Officer (domestic violence)" },
  { value: "posh_committee", label: "Internal Committee (workplace / college)" },
  { value: "cyber", label: "Cyber crime cell / portal" },
];

const FIELDS: { key: keyof ComplaintIn; label: string; type?: string; area?: boolean }[] = [
  { key: "name", label: "Your name" },
  { key: "address", label: "Your address" },
  { key: "incident_date", label: "Date of incident", type: "date" },
  { key: "incident_place", label: "Place of incident" },
  { key: "accused", label: "Person(s) responsible (name / description)" },
  { key: "witnesses", label: "Witnesses" },
  { key: "description", label: "What happened (required)", area: true },
  { key: "evidence", label: "Evidence you have", area: true },
];

export default function ComplaintPage() {
  const [crimes, setCrimes] = useState<CrimeSummary[]>([]);
  const [form, setForm] = useState<ComplaintIn>({ authority_type: "police", language: "English", description: "" });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    getCrimes().then(setCrimes).catch(() => {});
    try {
      const saved = JSON.parse(sessionStorage.getItem("nr_case") || "null");
      if (saved) setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(saved).filter(([, v]) => v)) }));
    } catch {}
  }, []);

  const set = (k: keyof ComplaintIn, v: string) => setForm((f) => ({ ...f, [k]: v || undefined }));

  const generate = async () => {
    setBusy(true); setErr("");
    try { setText((await draftComplaint(form)).text); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rose-800">Draft a formal complaint</h1>
      <p className="text-sm text-slate-600">Fill what you can. Anything missing becomes a [PLACEHOLDER] you can edit. Nothing is stored.</p>

      <Card>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-slate-600">Send to</span>
            <select className="w-full rounded border px-2 py-1.5" value={form.authority_type} onChange={(e) => set("authority_type", e.target.value)}>
              {AUTHORITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-slate-600">Type of incident</span>
            <select className="w-full rounded border px-2 py-1.5" value={form.crime_slug || ""} onChange={(e) => set("crime_slug", e.target.value)}>
              <option value="">Select</option>
              {crimes.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          {FIELDS.map((f) => (
            <label key={f.key} className={`space-y-1 ${f.area ? "sm:col-span-2" : ""}`}>
              <span className="block text-slate-600">{f.label}</span>
              {f.area
                ? <textarea rows={4} className="w-full rounded border px-2 py-1.5" value={(form[f.key] as string) || ""} onChange={(e) => set(f.key, e.target.value)} />
                : <input type={f.type || "text"} className="w-full rounded border px-2 py-1.5" value={(form[f.key] as string) || ""} onChange={(e) => set(f.key, e.target.value)} />}
            </label>
          ))}
          <label className="flex items-center gap-2">Language
            <select className="rounded border px-2 py-1" value={form.language} onChange={(e) => set("language", e.target.value)}>
              <option>English</option><option>Malayalam</option>
            </select>
          </label>
        </div>
        <button onClick={generate} disabled={busy || form.description.length < 10}
          className="mt-4 rounded-lg bg-rose-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Drafting…" : "Generate complaint"}
        </button>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </Card>

      {text && (
        <Card title="Your complaint (edit freely)">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={22}
            className="print-area w-full rounded border p-3 font-serif text-sm" />
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <button onClick={() => downloadDocx(text).catch((e) => setErr(String(e)))} className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white">Download Word (.docx)</button>
            <button onClick={() => navigator.clipboard.writeText(text)} className="rounded-lg border px-4 py-2">Copy</button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Review every line before submitting. Take two copies; ask for a signed acknowledgement or FIR copy.</p>
        </Card>
      )}
    </div>
  );
}
