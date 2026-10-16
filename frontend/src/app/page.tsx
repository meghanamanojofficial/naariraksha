"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

const CARDS = [
  { href: "/help", title: "Tell us what happened", body: "Describe it in your own words. Get the laws that apply, evidence to keep, and who to contact." },
  { href: "/crimes", title: "Know your rights", body: "Plain-language guides to crimes against women and the laws that protect you." },
  { href: "/complaint", title: "Draft a complaint", body: "A formal complaint for the police, magistrate, Protection Officer or POSH committee." },
  { href: "/directory", title: "Helplines & authorities", body: "National, Kerala and district contacts in one place." },
  { href: "/legal-aid", title: "Free legal aid", body: "Every woman is entitled to a free lawyer. Find one near you." },
];

export default function Home() {
  const [backend, setBackend] = useState<"checking" | "ok" | "down">("checking");
  useEffect(() => { getHealth().then(() => setBackend("ok")).catch(() => setBackend("down")); }, []);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold text-rose-800 sm:text-4xl">Your safety. Your rights. Your voice.</h1>
        <p className="max-w-2xl text-slate-600">A private first step when something happens to you. No sign-up needed.</p>
        {backend === "down" && <p className="text-sm text-red-600">Backend not reachable. Is it running? Check NEXT_PUBLIC_API_URL.</p>}
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="font-semibold text-rose-700">{c.title} →</h2>
            <p className="mt-1 text-sm text-slate-600">{c.body}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-2xl bg-rose-700 p-5 text-white">
        <p className="font-semibold">In immediate danger?</p>
        <p className="text-sm">
          Call <a className="underline" href="tel:112">112</a> · Women helpline <a className="underline" href="tel:181">181</a> ·
          Cyber crime <a className="underline" href="tel:1930">1930</a> · Child helpline <a className="underline" href="tel:1098">1098</a>
        </p>
      </section>
    </div>
  );
}
