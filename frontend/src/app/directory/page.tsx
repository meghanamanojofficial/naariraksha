"use client";
import { useEffect, useState } from "react";
import { AuthorityItem, Card } from "@/components/ui";
import { getAuthorities, getMeta, TYPE_LABELS, type Authority } from "@/lib/api";

const LEVELS = [{ v: "national", l: "National" }, { v: "state", l: "Kerala" }, { v: "district", l: "District" }];

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
      <h1 className="text-2xl font-bold text-rose-800">Helplines & authorities</h1>
      <div className="flex flex-wrap gap-3 text-sm">
        <select className="rounded border px-2 py-1.5" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">All districts</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="rounded border px-2 py-1.5" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {LEVELS.map(({ v, l }) => {
        const list = visible.filter((a) => a.level === v);
        return list.length ? (
          <Card key={v} title={l}><ul className="space-y-3">{list.map((a) => <AuthorityItem key={a.id} a={a} />)}</ul></Card>
        ) : null;
      })}
    </div>
  );
}
