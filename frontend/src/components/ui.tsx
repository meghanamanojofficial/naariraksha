import type { Authority, Law, LegalAid } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/api";

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-rose-100 bg-white p-4 shadow-sm ${className}`}>
      {title && <h3 className="mb-2 font-semibold text-rose-800">{title}</h3>}
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

export function LawItem({ law }: { law: Law }) {
  return (
    <div className="border-l-4 border-rose-300 pl-3 text-sm">
      <p className="font-medium">{law.title}</p>
      <p className="text-rose-800">{law.citation}</p>
      {law.also_known_as && <p className="text-xs text-slate-500">{law.also_known_as}</p>}
      <p className="mt-1 text-slate-700">{law.plain_en}</p>
      {law.cognizable !== null && (
        <p className="mt-1 text-xs text-slate-500">
          {law.cognizable ? "Cognizable (police can register an FIR directly)" : "Non-cognizable"}
          {law.bailable !== null && ` · ${law.bailable ? "Bailable" : "Non-bailable"}`}
        </p>
      )}
    </div>
  );
}

function Contact({ phone, url }: { phone: string | null; url: string | null }) {
  return (
    <span className="space-x-2">
      {phone && <a className="font-semibold text-rose-700 underline" href={`tel:${phone}`}>{phone}</a>}
      {url && <a className="text-rose-700 underline" href={url} target="_blank" rel="noreferrer">{url.replace(/^https?:\/\//, "")}</a>}
      {!phone && !url && <span className="text-xs text-amber-700">contact to be added</span>}
    </span>
  );
}

export function AuthorityItem({ a }: { a: Authority }) {
  return (
    <li className="text-sm">
      <span className="mr-2 rounded bg-rose-50 px-1.5 py-0.5 text-xs text-rose-800">{TYPE_LABELS[a.type] || a.type}</span>
      <b>{a.name}</b>{a.district && <span className="text-slate-500"> · {a.district}</span>}: <Contact phone={a.phone} url={a.url} />
      {!a.verified && <span className="ml-2 text-xs text-amber-700">(unverified)</span>}
      {a.notes && <p className="text-xs text-slate-500">{a.notes}</p>}
    </li>
  );
}

export function LegalAidItem({ x, action }: { x: LegalAid; action?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-100 p-3 text-sm">
      <div>
        <p className="font-semibold">{x.name} {x.demo && <span className="ml-1 rounded bg-amber-100 px-1.5 text-xs text-amber-800">demo data</span>}</p>
        <p className="text-xs text-slate-500">
          {x.district || "All districts"} · {x.languages.join(", ")} · {x.free ? "Free" : "Paid"}{!x.verified && " · unverified"}
        </p>
        <Contact phone={x.phone} url={x.url} />
      </div>
      {action}
    </li>
  );
}
