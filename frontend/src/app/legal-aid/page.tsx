"use client";
import { ArrowRight, Gavel, Lock, MapPin, Phone, PhoneCall, Scale, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LegalAidItem, PageHeader } from "@/components/ui";
import { getLegalAid, getMeta, requestCallback, type LegalAid } from "@/lib/api";

export default function LegalAidPage() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState("");
  const [items, setItems] = useState<LegalAid[]>([]);
  const [target, setTarget] = useState<LegalAid | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", language: "Malayalam", consent: false });
  const [msg, setMsg] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getMeta().then((m) => setDistricts(m.districts)).catch(() => {}); }, []);
  useEffect(() => { getLegalAid(district || undefined).then(setItems).catch((e) => setMsg(String(e))); }, [district]);
  useEffect(() => { if (target) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [target]);

  const submit = async () => {
    setMsg("");
    try {
      await requestCallback({ ...form, district: district || undefined, legal_aid_id: target?.id });
      setMsg("Request sent. You will be contacted on the number you gave.");
      setTarget(null);
    } catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Legal Services Authorities Act, 1987 · Section 12(c)" title="Free legal aid">
        Every woman in India is entitled to <b className="text-ink">free legal services</b>, including a lawyer, regardless of income.
      </PageHeader>

      <section className="glass flex flex-col gap-4 border-l-4 !border-l-primary-container p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="icon-badge h-12 w-12"><Scale size={22} /></span>
          <div>
            <p className="eyebrow text-secondary">National legal aid helpline (NALSA)</p>
            <p className="text-xl font-bold text-primary-container">Toll-free: 15100</p>
            <p className="text-xs text-ink-muted">Or contact your District Legal Services Authority (DLSA) below.</p>
          </div>
        </div>
        <a href="tel:15100" className="btn-primary"><Phone size={16} /> Call 15100</a>
      </section>

      <section className="glass flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
        <label className="sm:w-72">
          <span className="label flex items-center gap-1"><MapPin size={12} /> Filter by Kerala district</span>
          <select className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <p className="flex items-center gap-1.5 text-xs text-ink-muted"><ShieldCheck size={14} className="text-emerald-600" /> Free directory. No paid listings or referral fees.</p>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Legal aid {district ? `in ${district}` : "across Kerala"}</h2>
        <span className="text-xs text-ink-muted">{items.length} listed</span>
      </div>
      <ul className="space-y-3">
        {items.map((x) => (
          <LegalAidItem key={x.id} x={x} action={
            <button onClick={() => { setTarget(x); setMsg(""); }} className="btn-primary shrink-0 !min-h-10">Request callback <ArrowRight size={15} /></button>
          } />
        ))}
      </ul>

      {target && (
        <section ref={formRef} className="glass relative scroll-mt-24 overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rotate-45 bg-primary-fixed/40" />
          <div className="relative">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><PhoneCall size={20} className="text-primary-container" /> Request a callback from {target.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-soft">We only share your name, number and language with them. We do not ask for or store what happened to you.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label>
                <span className="label flex justify-between">Name <span className="font-normal text-primary-container">First name is enough</span></span>
                <input placeholder="e.g. Priya" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                <span className="label">Phone number</span>
                <input placeholder="+91 98765 43210" inputMode="tel" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                <span className="label">Preferred language</span>
                <select className="field" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option>Malayalam</option><option>English</option><option>Tamil</option><option>Hindi</option>
                </select>
              </label>
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
              <input type="checkbox" className="check mt-0.5" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
              I agree to share my name and phone number with this legal-aid provider so they can call me. We do not store what happened to you.
            </label>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={submit} disabled={!form.consent || !form.name || !form.phone} className="btn-primary !min-h-12 !px-6">Send request <Lock size={15} /></button>
              <button onClick={() => setTarget(null)} className="text-sm text-ink-soft hover:text-primary-container">Cancel</button>
            </div>
          </div>
        </section>
      )}
      {msg && <p className="rounded-2xl bg-white/80 p-3 text-sm text-primary">{msg}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Wallet, title: "No fees", body: "Legal aid covers the lawyer, advice and court fees. You pay nothing, whatever your income." },
          { icon: Gavel, title: "Any kind of case", body: "Criminal complaints, protection orders, maintenance, custody and workplace cases." },
          { icon: ShieldCheck, title: "Your choice", body: "Asking for advice doesn't commit you to a case. You decide what happens next." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="tile p-5">
            <span className="icon-badge h-9 w-9"><Icon size={18} /></span>
            <p className="mt-3 font-semibold">{title}</p>
            <p className="mt-1 text-sm text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
