"use client";
import { ArrowRight, Bot, Building2, ChevronRight, FileText, Gavel, Lock, MessageCircleHeart, Phone, Scale, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import SafetyCard from "@/components/SafetyCard";
import { getHealth } from "@/lib/api";

const CARDS = [
  { href: "/help", icon: MessageCircleHeart, title: "Tell us what happened", body: "Describe it in your own words. Get the laws that apply, evidence to keep, and who to contact." },
  { href: "/crimes", icon: Scale, title: "Know your rights", body: "Plain-language guides to crimes against women and the laws that protect you." },
  { href: "/complaint", icon: FileText, title: "Draft a complaint", body: "A formal complaint for the police, magistrate, Protection Officer or POSH committee." },
  { href: "/directory", icon: Phone, title: "Helplines & authorities", body: "National, Kerala and district contacts in one place." },
  { href: "/legal-aid", icon: Gavel, title: "Free legal aid", body: "Every woman is entitled to a free lawyer. Find one near you." },
];

export default function Home() {
  const [backend, setBackend] = useState<"checking" | "ok" | "down">("checking");
  const [safety, setSafety] = useState(false);
  const [ask, setAsk] = useState(false);
  useEffect(() => { getHealth().then(() => setBackend("ok")).catch(() => setBackend("down")); }, []);
  useEffect(() => {
    if (!ask) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAsk(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ask]);

  return (
    <div className="space-y-8">
      {backend === "down" && (
        <p className="chip-warn chip !rounded-2xl !px-4 !py-2 !text-sm">Backend not reachable. Is it running? Check NEXT_PUBLIC_API_URL.</p>
      )}

      {/* Hero: crimson sanctuary */}
      <section className="relative flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-primary via-primary-container to-on-primary-fixed-variant text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,182,193,0.15)_0%,rgba(64,0,13,0.55)_100%)]" />
        <div className="animate-aura pointer-events-none absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-secondary-container/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-1/3 h-[32rem] w-[32rem] rounded-full bg-primary-fixed/20 blur-3xl" />
        <div className="animate-aura pointer-events-none absolute bottom-10 left-1/4 h-96 w-96 rounded-full bg-tertiary-container/30 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between p-4 sm:p-6">
          <button onClick={() => setSafety(true)}
            className="flex h-10 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-semibold uppercase tracking-wide backdrop-blur-xl transition hover:scale-105 hover:bg-white/25">
            <SlidersHorizontal size={16} /> Safety flashcard
          </button>
          <Link href="/clients"
            className="flex h-10 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-semibold uppercase tracking-wide backdrop-blur-xl transition hover:scale-105 hover:bg-white/25">
            <Building2 size={16} /> Clients
          </Link>
        </div>

        <div className="relative z-10 mx-auto my-auto flex max-w-3xl flex-col items-center px-4 pb-10 text-center">
          <div className="animate-float relative">
            <div className="pointer-events-none absolute inset-0 scale-125 rounded-full bg-gradient-to-t from-primary-fixed/40 via-secondary-container/30 to-transparent blur-3xl" />
            <Image src="/lady-justice.png" alt="Lady Justice holding scales and a sword" width={400} height={510} priority
              className="relative h-[260px] w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] sm:h-[360px]" />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-primary-fixed-dim">Your safety · Your rights · Your voice</p>
          <h1 className="mt-2 select-none text-6xl font-extrabold leading-none tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-8xl">NariRaksha</h1>
          <p className="mt-4 max-w-xl text-lg text-on-primary-container sm:text-xl">
            Plain-language guidance on the laws that apply to you, a formal complaint you can file, and who to contact in Kerala.
          </p>
          <button onClick={() => setAsk(true)}
            className="group relative mt-6 flex h-12 min-w-[220px] items-center justify-center gap-2 overflow-hidden rounded-full bg-white/20 px-10 text-lg font-bold shadow-xl backdrop-blur-xl transition hover:bg-white/30 active:scale-95">
            <span className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <ShieldCheck size={22} /> Get Help <ArrowRight size={20} className="transition group-hover:translate-x-1" />
          </button>
          <p className="mt-5 flex items-center gap-1.5 rounded-full bg-on-secondary-fixed/40 px-4 py-2 text-sm text-on-primary-container backdrop-blur-md">
            <Lock size={14} className="text-primary-fixed" /> Free · Private · No sign-up. We don&apos;t store what you tell us.
          </p>
        </div>
        <div className="relative h-3 bg-primary-container" />
      </section>

      {/* Emergency strip */}
      <section className="glass flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="h-2 w-2 rounded-full bg-primary-container" />
          <b>In immediate danger?</b>
          <span className="text-secondary">Women helpline 181 · Cyber crime 1930 · Child helpline 1098</span>
        </p>
        <a href="tel:112" className="btn-sos"><Phone size={16} /> Call 112</a>
      </section>

      {/* What you can do here */}
      <section id="actions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ href, icon: Icon, title, body }) => (
          <Link key={href} href={href} className="glass group flex flex-col gap-3 p-6 transition hover:-translate-y-0.5">
            <span className="icon-badge"><Icon size={20} /></span>
            <h2 className="text-lg font-semibold text-primary-container">{title}</h2>
            <p className="flex-1 text-sm text-ink-soft">{body}</p>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary-container">Open <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>

      {/* "Get Help" sheet */}
      {ask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-md sm:justify-end sm:pr-8" onClick={() => setAsk(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="ask-title" onClick={(e) => e.stopPropagation()}
            className="glass-strong relative w-full max-w-xl overflow-hidden p-6 text-center sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-fixed/50 blur-3xl" />
            <button onClick={() => setAsk(false)} aria-label="Close"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-surface-container-low">
              <X size={20} />
            </button>
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed to-white text-primary-container shadow-[0_0_0_6px_rgba(255,218,219,0.6)]">
              <Bot size={44} />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white bg-primary-container" />
            </div>
            <span className="chip relative mt-5"><ShieldCheck size={12} /> Confidential assistant · NariRaksha</span>
            <h2 id="ask-title" className="relative mt-3 text-2xl font-semibold text-ink sm:text-3xl">Your private space for legal support</h2>
            <p className="relative mt-2 text-sm text-ink-soft">
              Tell us what happened, in Malayalam or English. You&apos;ll get the laws that apply, the evidence to keep and who can help. No chats are saved.
            </p>
            <Link href="/help" className="relative mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl bg-surface-container-low text-xl font-bold uppercase tracking-wide text-primary-container shadow-sm transition hover:bg-surface-container">
              <Bot size={24} /> Please ask <ArrowRight size={20} />
            </Link>
            <div className="relative mt-4 grid gap-3 text-left sm:grid-cols-2">
              <Link href="/crimes" className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:bg-rose-50">
                <span className="icon-badge"><Scale size={18} /></span>
                <span className="flex-1"><b className="block text-sm text-ink">Know your rights</b><span className="text-xs text-primary-container">Laws, explained simply</span></span>
                <ChevronRight size={18} className="text-ink-muted" />
              </Link>
              <Link href="/directory" className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:bg-rose-50">
                <span className="icon-badge"><Phone size={18} /></span>
                <span className="flex-1"><b className="block text-sm text-ink">Helplines</b><span className="text-xs text-primary-container">181 · 1930 · 1098</span></span>
                <ChevronRight size={18} className="text-ink-muted" />
              </Link>
            </div>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-ink">
              <Link href="/complaint" className="flex items-center gap-1 underline decoration-rose-200 underline-offset-4 hover:text-primary-container"><FileText size={15} /> Draft a complaint</Link>
              <span className="h-1 w-1 rounded-full bg-rose-300" />
              <Link href="/legal-aid" className="flex items-center gap-1 underline decoration-rose-200 underline-offset-4 hover:text-primary-container"><Gavel size={15} /> Free legal aid</Link>
            </div>
            <p className="relative mt-4 flex items-center justify-center gap-1 text-xs text-secondary"><Lock size={12} /> Nothing you type is stored. Quick exit clears this tab.</p>
          </div>
        </div>
      )}

      <SafetyCard open={safety} onClose={() => setSafety(false)} />
    </div>
  );
}
