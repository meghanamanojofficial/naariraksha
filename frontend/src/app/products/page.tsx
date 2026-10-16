import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold text-rose-800 sm:text-3xl">Products for institutions</h1>
        <p className="max-w-3xl text-slate-600">
          NariRaksha is <b>always free for every woman</b>. Institutions fund the platform so they can deliver safety
          and legal support better: customised resources, training and implementation.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <article key={p.id} className="flex flex-col rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>{p.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-rose-800">{p.name}</h2>
                <p className="text-sm text-slate-500">{p.tagline}</p>
              </div>
            </div>
            <p className="mt-4 text-sm"><b>For:</b> {p.for}</p>
            <p className="mt-3 text-sm font-medium">Includes:</p>
            <ul className="mt-1 flex-1 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
              {p.includes.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <div className="mt-6 flex items-end justify-between border-t border-rose-100 pt-4">
              <div>
                <p className="text-xs text-slate-500">Pilot pricing</p>
                <p className="text-xl font-bold text-rose-700">{p.price}</p>
              </div>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800">Annual licence</span>
            </div>
            <Link href={`/clients/register?product=${p.id}`}
              className="mt-4 rounded-lg bg-rose-700 py-2 text-center text-sm font-semibold text-white hover:bg-rose-800">
              Request a pilot
            </Link>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-rose-100 bg-white p-5 text-sm text-slate-700">
        <h3 className="mb-2 font-semibold text-rose-800">Our promise</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Essential guidance, complaint drafting and helplines stay free for individuals, always.</li>
          <li>Institutions never see who used NariRaksha or what they shared. Reports are aggregate only.</li>
          <li>We never sell data, run ads, or accept paid rankings of lawyers or services.</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">Prices are pilot estimates and depend on size and scope.</p>
      </section>
    </div>
  );
}
