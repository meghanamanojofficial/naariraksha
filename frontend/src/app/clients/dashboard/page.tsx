"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { getMe, logout, type Org } from "@/lib/clients";
import { productById } from "@/lib/products";

const STATUS: Record<string, string> = { pilot_requested: "Pilot requested: we'll contact you shortly", active: "Active", inactive: "Inactive" };

function Dashboard() {
  const router = useRouter();
  const welcome = useSearchParams().get("welcome");
  const [org, setOrg] = useState<Org | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => { getMe().then(setOrg).catch((e) => setErr(e instanceof Error ? e.message : String(e))); }, []);

  if (err) return (
    <div className="mx-auto max-w-xl space-y-3">
      <p className="text-red-600">{err}</p>
      <Link href="/clients/login" className="text-primary-container underline">Go to log in</Link>
    </div>
  );
  if (!org) return <p className="text-sm text-ink-muted">Loading…</p>;
  const plan = productById(org.product);

  return (
    <div className="space-y-6">
      {welcome && <div className="rounded-2xl border border-emerald-100 bg-emerald-50/90 p-4 text-sm text-emerald-800">Thank you for registering! Our team will contact {org.email} to set up your pilot.</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="chip">{plan?.icon} {org.product_name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{org.org_name}</h1>
        </div>
        <button onClick={() => { logout(); router.push("/clients"); }} className="btn-glass">Log out</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Plan"><p className="text-sm">{org.product_name}</p><p className="text-sm font-semibold text-primary-container">{plan?.price}</p></Card>
        <Card title="Status"><p className="text-sm">{STATUS[org.status] || org.status}</p></Card>
        <Card title="Contact"><p className="text-sm">{org.contact_name}{org.designation && `, ${org.designation}`}</p><p className="text-xs text-ink-muted">{org.email} · {org.phone}</p></Card>
      </div>

      <Card title="What's included">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft marker:text-primary-container">{plan?.includes.map((x) => <li key={x}>{x}</li>)}</ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Your resource directory">
          <p className="text-sm text-ink-soft">Add your {org.product === "campus" ? "campus" : "organisation"}&apos;s own contacts (Internal Committee, counsellor, security) so people see them alongside public helplines.</p>
          <p className="chip-warn chip mt-3">Coming in the pilot</p>
        </Card>
        <Card title="Aggregate insights">
          <p className="text-sm text-ink-soft">Anonymous, aggregate trends only (e.g. most-viewed topics). No individual is ever identifiable.</p>
          <p className="chip-warn chip mt-3">Coming in the pilot</p>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}><Dashboard /></Suspense>;
}
