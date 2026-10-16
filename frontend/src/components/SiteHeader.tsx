"use client";
import { Menu, Settings, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import QuickExit from "@/components/QuickExit";
import SafetyCard from "@/components/SafetyCard";
import { useLanguage } from "@/lib/language";

const NAV = [
  { href: "/help", label: "Get help" },
  { href: "/crimes", label: "Know your rights" },
  { href: "/complaint", label: "Draft complaint" },
  { href: "/directory", label: "Helplines" },
  { href: "/legal-aid", label: "Legal aid" },
  { href: "/products", label: "Products" },
  { href: "/clients", label: "Clients" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <ShieldCheck size={22} aria-hidden />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-primary">NariRaksha</span>
        <span className="whitespace-nowrap text-xs font-medium text-secondary">Kerala Legal Shield</span>
      </span>
    </Link>
  );
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const btn = (l: "English" | "Malayalam", label: string) => (
    <button type="button" onClick={() => setLanguage(l)} aria-pressed={language === l}
      title={l === "Malayalam" ? "Replies, voice and drafts in Malayalam" : "Replies, voice and drafts in English"}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${language === l ? "bg-white text-primary-container shadow-[0_1px_4px_rgba(0,0,0,0.06)]" : "text-on-surface-variant hover:text-ink"}`}>
      {label}
    </button>
  );
  return (
    <div className="flex items-center rounded-full bg-surface-container p-1">
      {btn("English", "EN")}
      {btn("Malayalam", "മലയാളം")}
    </div>
  );
}

export default function SiteHeader() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [safety, setSafety] = useState(false);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-white/85 shadow-[0_1px_12px_rgba(190,18,60,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-1">
          <button onClick={() => setSafety(true)} title="Safety & privacy"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-ink">
            <Settings size={20} aria-hidden /><span className="sr-only">Safety and privacy</span>
          </button>
          <Logo />
        </div>
        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm transition ${active(n.href) ? "bg-primary-container font-semibold text-white" : "text-ink hover:bg-surface-container-low hover:text-primary-container"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LanguageToggle /></div>
          <QuickExit compact />
          <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-container xl:hidden">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="border-t border-rose-100 bg-white/95 px-4 pb-4 pt-2 xl:hidden">
          <div className="mb-2 sm:hidden"><LanguageToggle /></div>
          <div className="grid gap-1 sm:grid-cols-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)}
                className={`rounded-2xl px-4 py-3 text-sm ${active(n.href) ? "bg-primary-container font-semibold text-white" : "bg-surface-container-low text-ink"}`}>
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
      <SafetyCard open={safety} onClose={() => setSafety(false)} />
    </header>
  );
}
