import Link from "next/link";

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-rose-800">Client portal</h1>
      <p className="text-slate-600">For colleges, NGOs and employers using NariRaksha Campus, Partner or Workplace.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/clients/login" className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-lg font-semibold text-rose-700">Log in →</h2>
          <p className="mt-1 text-sm text-slate-600">Already a client? Access your institution&apos;s account.</p>
        </Link>
        <Link href="/clients/register" className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-lg font-semibold text-rose-700">Register →</h2>
          <p className="mt-1 text-sm text-slate-600">New institution? Choose a plan and request a pilot.</p>
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        Looking for help for yourself? You don&apos;t need an account. <Link href="/help" className="text-rose-700 underline">Get help here</Link>.
      </p>
    </div>
  );
}
