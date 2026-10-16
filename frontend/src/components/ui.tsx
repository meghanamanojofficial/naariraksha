import { CheckCircle2, ExternalLink, MapPin, Phone } from "lucide-react";
import type { Authority, Law, LegalAid } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/api";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

export function Card({ title, icon: Icon, badge, subtitle, children, className = "" }: {
  title?: string; icon?: IconType; badge?: React.ReactNode; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`glass p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && <span className="icon-badge"><Icon size={20} /></span>}
            <div>
              <h3 className="text-lg font-semibold text-primary">{title}</h3>
              {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
            </div>
          </div>
          {badge}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, children, aside }: { eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {children && <div className="text-base text-ink-soft">{children}</div>}
      </div>
      {aside}
    </div>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-container" aria-hidden />
          <span className="text-ink-soft">{x}</span>
        </li>
      ))}
    </ul>
  );
}

export function LawItem({ law }: { law: Law }) {
  return (
    <div className={`rounded-2xl border p-4 text-sm ${law.key ? "border-rose-200 bg-white" : "border-white bg-surface-container-low/70"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{law.citation}</span>
        {law.key && <span className="chip !bg-primary-container !text-white !border-primary-container">Most relevant</span>}
        {law.cognizable !== null && <span className={law.cognizable ? "chip-ok chip" : "chip-info chip"}>{law.cognizable ? "Cognizable" : "Non-cognizable"}</span>}
        {law.bailable !== null && <span className="chip-info chip">{law.bailable ? "Bailable" : "Non-bailable"}</span>}
      </div>
      <p className="mt-2 font-semibold text-ink">{law.title}</p>
      {law.also_known_as && <p className="text-xs text-ink-muted">{law.also_known_as}</p>}
      <p className="mt-1 text-ink-soft">{law.plain_en}</p>
      {law.cognizable && <p className="mt-2 text-xs text-ink-muted">Cognizable: the police can register an FIR directly.</p>}
    </div>
  );
}

function Contact({ phone, url }: { phone: string | null; url: string | null }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {phone && <a className="font-semibold text-primary-container" href={`tel:${phone}`}>{phone}</a>}
      {url && (
        <a className="inline-flex items-center gap-1 text-primary-container underline decoration-rose-200 underline-offset-2" href={url} target="_blank" rel="noreferrer">
          {url.replace(/^https?:\/\//, "")} <ExternalLink size={12} />
        </a>
      )}
      {!phone && !url && <span className="text-xs text-amber-700">contact to be added</span>}
    </span>
  );
}

export function AuthorityItem({ a }: { a: Authority }) {
  return (
    <li className="tile flex items-start justify-between gap-3 p-4 text-sm">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{TYPE_LABELS[a.type] || a.type}</span>
          {!a.verified && <span className="chip-warn chip">unverified</span>}
        </div>
        <p className="font-semibold text-ink">{a.name}{a.district && <span className="font-normal text-ink-muted"> · {a.district}</span>}</p>
        {a.notes && <p className="text-xs text-ink-muted">{a.notes}</p>}
        <Contact phone={a.phone} url={a.url} />
      </div>
      {a.phone && (
        <a href={`tel:${a.phone}`} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-primary-container shadow-sm hover:bg-rose-50">
          <Phone size={14} /> Dial
        </a>
      )}
    </li>
  );
}

export function LegalAidItem({ x, action }: { x: LegalAid; action?: React.ReactNode }) {
  return (
    <li className="glass flex flex-col gap-4 p-5 text-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {x.verified && <span className="chip-ok chip">Verified</span>}
          {x.free && <span className="chip">Free</span>}
          {x.demo && <span className="chip-warn chip">Demo data</span>}
          {!x.verified && !x.demo && <span className="chip-warn chip">Unverified</span>}
          {x.languages.length > 0 && <span className="chip-info chip">{x.languages.join(" / ")}</span>}
        </div>
        <p className="text-base font-semibold text-ink">{x.name}</p>
        <p className="flex items-center gap-1 text-xs text-ink-muted"><MapPin size={12} /> {x.district || "All districts"}{x.specialisations.length > 0 && ` · ${x.specialisations.join(", ")}`}</p>
        <Contact phone={x.phone} url={x.url} />
      </div>
      {action}
    </li>
  );
}
