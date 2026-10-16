import { ArrowRight, CheckCircle2, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { PRODUCTS } from "@/lib/products";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="For institutions" title="Products for institutions">
        NariRaksha is <b className="text-ink">always free for every woman</b>. Institutions fund the platform so they can deliver safety
        and legal support better: customised resources, training and implementation.
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <article key={p.id} className="glass flex flex-col p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl" aria-hidden>{p.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-primary">{p.name}</h2>
                <p className="text-sm text-ink-muted">{p.tagline}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-soft"><b className="text-ink">For:</b> {p.for}</p>
            <p className="mt-4 eyebrow text-secondary">Includes</p>
            <ul className="mt-2 flex-1 space-y-2 text-sm text-ink-soft">
              {p.includes.map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-container" />{x}</li>)}
            </ul>
            <div className="mt-6 flex items-end justify-between border-t border-rose-100 pt-4">
              <div>
                <p className="text-xs text-ink-muted">Pilot pricing</p>
                <p className="text-xl font-bold text-primary-container">{p.price}</p>
              </div>
              <span className="chip">Annual licence</span>
            </div>
            <Link href={`/clients/register?product=${p.id}`} className="btn-primary mt-4 w-full">Request a pilot <ArrowRight size={16} /></Link>
          </article>
        ))}
      </div>

      <section className="glass p-6 text-sm text-ink-soft">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-primary"><HeartHandshake size={20} /> Our promise</h3>
        <ul className="space-y-2">
          {[
            "Essential guidance, complaint drafting and helplines stay free for individuals, always.",
            "Institutions never see who used NariRaksha or what they shared. Reports are aggregate only.",
            "We never sell data, run ads, or accept paid rankings of lawyers or services.",
          ].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-container" />{x}</li>)}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">Prices are pilot estimates and depend on size and scope.</p>
      </section>
    </div>
  );
}
