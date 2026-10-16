"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductPicker from "@/components/ProductPicker";
import { Card } from "@/components/ui";
import { loginClient, setToken } from "@/lib/clients";
import type { ProductId } from "@/lib/products";

export default function ClientLoginPage() {
  const router = useRouter();
  const [product, setProduct] = useState<ProductId | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return setErr("Choose Campus, Partner or Workplace.");
    setBusy(true); setErr("");
    try {
      const { token } = await loginClient({ product, email, password });
      setToken(token);
      router.push("/clients/dashboard");
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-rose-800">Client log in</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4 text-sm">
          <div>
            <p className="mb-2 font-medium">Log in as</p>
            <ProductPicker value={product} onChange={setProduct} />
          </div>
          <label className="block space-y-1">
            <span className="text-slate-600">Work email</span>
            <input type="email" required autoComplete="email" className="w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-slate-600">Password</span>
            <input type="password" required autoComplete="current-password" className="w-full rounded border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {err && <p className="text-red-600">{err}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-rose-700 py-2.5 font-semibold text-white disabled:opacity-50">
            {busy ? "Logging in…" : "Log in"}
          </button>
          <p className="text-center text-slate-600">New here? <Link href="/clients/register" className="text-rose-700 underline">Register your institution</Link></p>
        </form>
      </Card>
    </div>
  );
}
