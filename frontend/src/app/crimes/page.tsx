"use client";
import { ArrowLeft, ArrowRight, Baby, Briefcase, EyeOff, Flame, HeartCrack, Info, LayoutGrid, Search, ShieldAlert, Smartphone, UserX, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCrimes, type CrimeSummary } from "@/lib/api";

// Icons for the categories used in backend/app/seed_data/crimes.json; unknown categories fall back to ShieldAlert.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  "Sexual violence": ShieldAlert, Harassment: UserX, Cybercrime: Smartphone, Privacy: EyeOff,
  "Abuse at home": HeartCrack, Workplace: Briefcase, Violence: Flame, "Child protection": Baby,
};

export default function CrimesPage() {
  const [crimes, setCrimes] = useState<CrimeSummary[]>([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  useEffect(() => { getCrimes().then(setCrimes).catch((e) => setErr(String(e))); }, []);

  const categories = useMemo(() => [...new Set(crimes.map((c) => c.category))], [crimes]);
  const visible = crimes.filter((c) =>
    (!cat || c.category === cat) &&
    (!q || `${c.name} ${c.summary} ${c.category}`.toLowerCase().includes(q.toLowerCase())));
  const groups = visible.reduce<Record<string, CrimeSummary[]>>((acc, c) => ((acc[c.category] ||= []).push(c), acc), {});

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link href="/" className="flex items-center gap-1 text-ink-soft hover:text-primary-container"><ArrowLeft size={14} /> Back home</Link>
        <span className="chip"><span className="h-1.5 w-1.5 rounded-full bg-primary-container" /> BNS · BNSS · BSA with old IPC / CrPC equivalents</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass space-y-4 p-6 sm:p-8 lg:col-span-2">
          <span className="chip"><ShieldAlert size={12} /> Plain-language legal guides</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-primary">Know your rights</span> <span className="font-normal text-ink">· the laws that protect you</span>
          </h1>
          <p className="text-ink-soft">
            Crimes against women explained simply: what the law says, the evidence to keep, the documents to carry and who can help.
          </p>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-container" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. stalking, dowry, photos, workplace"
              className="field !h-12 !pl-11 !pr-20" aria-label="Search topics" />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs text-ink-muted hover:text-ink">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </section>
        <aside className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary-container to-primary p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-fixed">Fast fact</p>
            <h2 className="text-2xl font-bold">Zero FIR</h2>
            <p className="text-sm text-on-primary-container">
              You can report a cognizable offence at <b className="text-white">any</b> police station, wherever it happened, and you are entitled to a free copy of the FIR.
            </p>
            <div className="rounded-2xl bg-white/10 p-3 text-xs text-on-primary-container">
              <p className="flex items-center gap-1 font-semibold text-white"><Info size={13} /> BNSS Section 173</p>
              Formerly CrPC Section 154. If the police refuse, you can approach a magistrate under BNSS 175(3).
            </div>
          </div>
          <Link href="/help" className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-primary-container hover:bg-rose-50">
            Get guidance for my situation <ArrowRight size={16} />
          </Link>
        </aside>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCat("")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${!cat ? "bg-primary-container text-white" : "bg-white/80 text-ink-soft hover:bg-white"}`}>
            <LayoutGrid size={14} /> All ({crimes.length})
          </button>
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c] || ShieldAlert;
            return (
              <button key={c} onClick={() => setCat(c === cat ? "" : c)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${cat === c ? "bg-primary-container text-white" : "bg-white/80 text-ink-soft hover:bg-white"}`}>
                <Icon size={14} /> {c}
              </button>
            );
          })}
        </div>
      )}

      {Object.entries(groups).map(([category, list], i) => {
        const Icon = CATEGORY_ICONS[category] || ShieldAlert;
        return (
          <section key={category} className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="icon-badge h-9 w-9"><Icon size={18} /></span>
              <div>
                <p className="eyebrow text-[10px] text-secondary">Section {String(i + 1).padStart(2, "0")}</p>
                <h2 className="text-xl font-semibold">{category}</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((c) => (
                <Link key={c.slug} href={`/crimes/${c.slug}`} className="glass group flex flex-col gap-3 p-6 transition hover:-translate-y-0.5">
                  <span className="icon-badge"><Icon size={20} /></span>
                  <h3 className="text-lg font-semibold text-primary-container">{c.name}</h3>
                  <p className="flex-1 text-sm text-ink-soft">{c.summary}</p>
                  <span className="flex items-center justify-end gap-1 text-sm font-semibold text-primary-container">
                    View legal case file <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {crimes.length > 0 && visible.length === 0 && <p className="text-sm text-ink-muted">No topics match &ldquo;{q}&rdquo;. Try another word, or <Link href="/help" className="text-primary-container underline">describe what happened</Link>.</p>}
    </div>
  );
}
