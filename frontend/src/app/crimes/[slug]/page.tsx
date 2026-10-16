"use client";
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
  if (!crime) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-5">
      <Link href="/crimes" className="text-sm text-rose-700 underline">← All topics</Link>
      <h1 className="text-2xl font-bold text-rose-800">{crime.name}</h1>
      <p className="text-slate-700">{crime.summary}</p>
      <Card title="The law">
        <div className="space-y-3">{crime.laws.map((l) => <LawItem key={l.code} law={l} />)}</div>
        <p className="mt-3 text-xs text-slate-500">For incidents before 1 July 2024, the old IPC / CrPC / Evidence Act sections shown as &quot;formerly&quot; apply.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Evidence to keep"><Bullets items={crime.evidence} /></Card>
        <Card title="Documents to carry"><Bullets items={crime.documents} /></Card>
      </div>
      <Card title="Who can help"><ul className="space-y-2">{crime.authorities.map((a) => <AuthorityItem key={a.id} a={a} />)}</ul></Card>
      <div className="flex flex-wrap gap-3">
        <Link href="/help" className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Get guidance for my situation</Link>
        <Link href="/complaint" className="rounded-lg border border-rose-700 px-4 py-2 text-sm font-semibold text-rose-700">Draft a complaint</Link>
      </div>
    </div>
  );
}
