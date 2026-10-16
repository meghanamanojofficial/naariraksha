"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
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
  const [show, setShow] = useState(false);
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
      <h1 className="text-4xl font-extrabold tracking-tight text-primary">Client log in</h1>
      <Card>
        <form onSubmit={submit} className="space-y-5 text-sm">
          <div>
            <p className="label !text-sm">Log in as</p>
            <ProductPicker value={product} onChange={setProduct} />
          </div>
          <label className="block">
            <span className="label !text-sm">Work email</span>
            <input type="email" required autoComplete="email" placeholder="name@institution.ac.in" className="field !h-12" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="label !text-sm">Password</span>
            <span className="relative block">
              <input type={show ? "text" : "password"} required autoComplete="current-password" className="field !h-12 !pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
          </label>
          {err && <p className="text-red-600">{err}</p>}
          <button disabled={busy} className="btn-primary !min-h-12 w-full !text-base">
            {busy ? "Logging in…" : "Log in"}
          </button>
          <p className="text-center text-ink-soft">New here? <Link href="/clients/register" className="font-medium text-primary-container underline underline-offset-4">Register your institution</Link></p>
        </form>
      </Card>
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted"><Lock size={12} className="text-emerald-600" /> Client accounts are kept separate from anyone seeking help.</p>
    </div>
  );
}
