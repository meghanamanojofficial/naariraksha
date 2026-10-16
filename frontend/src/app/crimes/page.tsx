"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCrimes, type CrimeSummary } from "@/lib/api";

export default function CrimesPage() {
  const [crimes, setCrimes] = useState<CrimeSummary[]>([]);
  const [err, setErr] = useState("");
  useEffect(() => { getCrimes().then(setCrimes).catch((e) => setErr(String(e))); }, []);

  const groups = crimes.reduce<Record<string, CrimeSummary[]>>((acc, c) => ((acc[c.category] ||= []).push(c), acc), {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rose-800">Know your rights</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {Object.entries(groups).map(([cat, list]) => (
        <section key={cat} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((c) => (
              <Link key={c.slug} href={`/crimes/${c.slug}`} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm hover:shadow-md">
                <p className="font-semibold text-rose-700">{c.name}</p>
                <p className="mt-1 text-sm text-slate-600">{c.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
