"use client";
import { ArrowLeft, ArrowRight, BookOpen, Bot, ClipboardCheck, FileText, FolderOpen, Info, Scale, ShieldCheck, Siren, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthorityItem, Bullets, Card, LawItem } from "@/components/ui";
import { getCrime, type CrimeDetail } from "@/lib/api";

export default function CrimeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [crime, setCrime] = useState<CrimeDetail | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { getCrime(slug).then(setCrime).catch((e) => setErr(String(e))); }, [slug]);

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!crime) return <p className="text-sm text-ink-muted">Loading…</p>;

  // Quick facts derived only from the laws in the library
  const cognizable = crime.laws.some((l) => l.cognizable);
  const withBail = crime.laws.filter((l) => l.bailable !== null);
  const nonBailable = withBail.some((l) => l.bailable === false);
  const facts = [
    cognizable && { icon: ShieldCheck, title: "Cognizable offence", body: "Police must register an FIR. You don't need a magistrate's order first." },
    withBail.length > 0 && { icon: Scale, title: nonBailable ? "Some sections are non-bailable" : "Bailable", body: nonBailable ? "The accused cannot claim bail as a right under those sections." : "The accused can usually get bail, but the case still goes ahead." },
    { icon: BookOpen, title: `${crime.laws.length} law${crime.laws.length === 1 ? "" : "s"} in our library`, body: "Each one checked by our team, with the old section next to the new one." },
  ].filter(Boolean) as { icon: typeof Scale; title: string; body: string }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link href="/crimes" className="flex items-center gap-1 text-ink-soft hover:text-primary-container"><ArrowLeft size={14} /> All topics / Know your rights</Link>
        <span className="chip"><span className="h-1.5 w-1.5 rounded-full bg-primary-container" /> {crime.category}</span>
      </div>

      <section className="glass relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-container via-secondary-container to-transparent" />
        <span className="chip">Legal case file</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">{crime.name}</h1>
        <p className="mt-2 max-w-3xl text-ink-soft">{crime.summary}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {facts.map(({ icon: Icon, title, body }) => (
            <div key={title} className="tile flex gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-white"><Icon size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-primary-container">{title}</p>
                <p className="text-xs text-ink-soft">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Card title="The law" icon={BookOpen} subtitle="From our verified legal library">
        <div className="mb-4 flex gap-2 rounded-2xl bg-primary-fixed/50 p-3 text-xs text-on-primary-fixed-variant">
          <Info size={15} className="mt-0.5 shrink-0" />
          <p><b>Which law applies:</b> for incidents before 1 July 2024, the old IPC / CrPC / Evidence Act sections shown as &quot;formerly&quot; apply. From that date, BNS / BNSS / BSA apply.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">{crime.laws.map((l) => <LawItem key={l.code} law={l} />)}</div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Evidence to keep" icon={FolderOpen} subtitle="Don't delete anything, even if it is upsetting"><Bullets items={crime.evidence} /></Card>
        <Card title="Documents to carry" icon={ClipboardCheck} subtitle="To the police station or office"><Bullets items={crime.documents} /></Card>
      </div>

      <Card title="Who can help" icon={Users} subtitle="Helplines and offices from our directory">
        <ul className="grid gap-3 md:grid-cols-2">{crime.authorities.map((a) => <AuthorityItem key={a.id} a={a} />)}</ul>
      </Card>

      <section className="glass flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="icon-badge"><Siren size={18} /></span>
          <div>
            <p className="font-semibold">Need to act on this now?</p>
            <p className="text-xs text-ink-muted">Get step-by-step guidance for your own situation.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/complaint" className="btn-glass"><FileText size={16} /> Draft a complaint</Link>
          <Link href="/help" className="btn-primary"><Bot size={16} /> Get guidance for my situation <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
