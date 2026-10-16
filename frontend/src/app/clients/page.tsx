import { ArrowRight, Building2, Lock, LogIn, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="glass relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-fixed/50 blur-3xl" />
        <div className="relative space-y-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">Client portal</h1>
          <p className="mx-auto max-w-2xl text-lg text-ink-soft">For colleges, NGOs and employers using NariRaksha Campus, Partner or Workplace.</p>
        </div>

        <div className="relative mt-8 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-[1.5rem] border border-rose-100 bg-white p-6">
            <div className="flex items-start justify-between">
              <span className="icon-badge h-12 w-12"><LogIn size={22} /></span>
              <span className="text-xs text-ink-muted">Registered accounts</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">Log in</h2>
            <p className="mt-2 flex-1 text-sm text-ink-soft">Already a client? Access your institution&apos;s account.</p>
            <Link href="/clients/login" className="btn-primary mt-6 !min-h-12 w-full">Log in <ArrowRight size={16} /></Link>
          </div>
          <div className="flex flex-col rounded-[1.5rem] border border-rose-100 bg-white p-6">
            <div className="flex items-start justify-between">
              <span className="icon-badge h-12 w-12"><Building2 size={22} /></span>
              <span className="chip">New partnership</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">Register your institution</h2>
            <p className="mt-2 flex-1 text-sm text-ink-soft">New institution? Choose a plan and request a pilot.</p>
            <Link href="/clients/register" className="btn-glass mt-6 !min-h-12 w-full !bg-rose-50">Register your institution</Link>
          </div>
        </div>

        <div className="relative mt-10 border-t border-rose-100 pt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Plans</h3>
              <p className="text-xs text-ink-muted">Annual licence, pilot pricing.</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-primary-container underline underline-offset-4">Compare full plan features →</Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PRODUCTS.map((p) => (
              <Link key={p.id} href={`/clients/register?product=${p.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-300">
                <span className="text-2xl" aria-hidden>{p.icon}</span>
                <p className="mt-2 text-lg font-semibold text-primary-container">{p.name.replace("NariRaksha ", "")}</p>
                <p className="text-sm text-ink-muted">{p.tagline}</p>
                <p className="mt-4 border-t border-slate-100 pt-3 font-semibold">{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-primary-container" /> Separate from victim data</span>
        <span className="flex items-center gap-1.5"><Lock size={15} className="text-primary-container" /> Aggregate reports only</span>
        <span className="flex items-center gap-1.5"><Users size={15} className="text-primary-container" /> Free for every woman, always</span>
      </div>
      <p className="text-center text-xs text-ink-muted">
        Looking for help for yourself? You don&apos;t need an account. <Link href="/help" className="text-primary-container underline">Get help here</Link>.
      </p>
    </div>
  );
}
