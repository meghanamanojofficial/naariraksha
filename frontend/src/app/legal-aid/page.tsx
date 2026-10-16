"use client";
import { useEffect, useState } from "react";
import { Card, LegalAidItem } from "@/components/ui";
import { getLegalAid, getMeta, requestCallback, type LegalAid } from "@/lib/api";

export default function LegalAidPage() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState("");
  const [items, setItems] = useState<LegalAid[]>([]);
  const [target, setTarget] = useState<LegalAid | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", language: "Malayalam", consent: false });
  const [msg, setMsg] = useState("");

  useEffect(() => { getMeta().then((m) => setDistricts(m.districts)).catch(() => {}); }, []);
  useEffect(() => { getLegalAid(district || undefined).then(setItems).catch((e) => setMsg(String(e))); }, [district]);

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
      <h1 className="text-2xl font-bold text-rose-800">Free legal aid</h1>
      <Card>
        <p className="text-sm">
          Every woman in India is entitled to <b>free legal services</b>, including a lawyer, regardless of income
          (Legal Services Authorities Act, 1987, Section 12(c)). Call <a href="tel:15100" className="font-semibold text-rose-700 underline">15100</a> or contact your District Legal Services Authority.
        </p>
      </Card>

      <select className="rounded border px-2 py-1.5 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
        <option value="">All districts</option>
        {districts.map((d) => <option key={d}>{d}</option>)}
      </select>

      <ul className="space-y-2">
        {items.map((x) => (
          <LegalAidItem key={x.id} x={x} action={
            <button onClick={() => { setTarget(x); setMsg(""); }} className="rounded-lg border border-rose-700 px-3 py-1 text-xs font-semibold text-rose-700">Request callback</button>
          } />
        ))}
      </ul>

      {target && (
        <Card title={`Request a callback from ${target.name}`}>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <input placeholder="Name (can be a first name only)" className="rounded border px-2 py-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Phone number" className="rounded border px-2 py-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select className="rounded border px-2 py-1.5" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option>Malayalam</option><option>English</option><option>Tamil</option><option>Hindi</option>
            </select>
          </div>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1" />
            I agree to share my name and phone number with this legal-aid provider so they can call me. We do not store what happened to you.
          </label>
          <button onClick={submit} disabled={!form.consent || !form.name || !form.phone}
            className="mt-3 rounded-lg bg-rose-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Send request</button>
        </Card>
      )}
      {msg && <p className="text-sm text-rose-800">{msg}</p>}
    </div>
  );
}
