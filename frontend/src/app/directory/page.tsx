"use client";
import { Headset, Phone, ShieldCheck, Siren } from "lucide-react";
import { useEffect, useState } from "react";
import QuickExit from "@/components/QuickExit";
import { AuthorityItem, PageHeader } from "@/components/ui";
import { getAuthorities, getMeta, TYPE_LABELS, type Authority } from "@/lib/api";

const LEVELS = [{ v: "national", l: "National helplines" }, { v: "state", l: "Kerala" }, { v: "district", l: "District" }];
// Shown as large cards at the top of the national list
const FEATURED: Record<string, { icon: typeof Siren; label: string; className: string }> = {
  emergency: { icon: Siren, label: "Immediate danger", className: "from-red-700 to-red-600" },
  women_helpline: { icon: Headset, label: "Women in distress", className: "from-primary to-primary-container" },
};

function FeaturedCard({ a }: { a: Authority }) {
  const f = FEATURED[a.type];
  const Icon = f.icon;
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${f.className} p-5 text-white shadow-lg`}>
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/90"><Icon size={15} /> {f.label}</p>
          <p className="text-5xl font-bold">{a.phone}</p>
          <p className="text-sm font-medium">{a.name}</p>
          {a.notes && <p className="max-w-sm text-sm text-white/85">{a.notes}</p>}
        </div>
        {a.phone && (
          <a href={`tel:${a.phone}`} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-primary-container shadow">
            <Phone size={15} /> Dial {a.phone}
          </a>
        )}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [items, setItems] = useState<Authority[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => { getMeta().then((m) => setDistricts(m.districts)).catch(() => {}); }, []);
  useEffect(() => { getAuthorities({ type: type || undefined }).then(setItems).catch((e) => setErr(String(e))); }, [type]);

  const visible = items.filter((a) => a.level !== "district" || !district || a.district === district);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="● 24/7 verified lifelines" title="Helplines & authorities">
        National, Kerala and district contacts in one place. Entries we haven&apos;t verified yet are marked.
      </PageHeader>

      <div className="glass grid gap-4 p-5 sm:grid-cols-2">
        <label>
          <span className="label">District</span>
          <select className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Service type</span>
          <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {LEVELS.map(({ v, l }, i) => {
        const list = visible.filter((a) => a.level === v);
        if (!list.length) return null;
        const featured = v === "national" ? list.filter((a) => FEATURED[a.type] && a.phone) : [];
        const rest = list.filter((a) => !featured.includes(a));
        return (
          <section key={v} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-primary-container" /> {i + 1}. {l}</h2>
              {v === "national" && <span className="text-xs text-ink-muted">Toll-free</span>}
              {v === "district" && district && <span className="chip">{district}</span>}
            </div>
            {featured.length > 0 && <div className="grid gap-4 md:grid-cols-2">{featured.map((a) => <FeaturedCard key={a.id} a={a} />)}</div>}
            {rest.length > 0 && <ul className="grid gap-3 md:grid-cols-2">{rest.map((a) => <AuthorityItem key={a.id} a={a} />)}</ul>}
          </section>
        );
      })}

      <div className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-ink-soft"><ShieldCheck size={16} className="text-primary-container" /> NariRaksha keeps no record of who you call. Your phone&apos;s call log does, so clear it if that&apos;s safer.</p>
        <QuickExit />
      </div>
    </div>
  );
}
