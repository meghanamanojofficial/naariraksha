"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ProductPicker from "@/components/ProductPicker";
import { Card } from "@/components/ui";
import { getMeta } from "@/lib/api";
import { registerClient, setToken, type RegisterIn } from "@/lib/clients";
import { productById, type ProductId } from "@/lib/products";

const ORG_LABEL: Record<ProductId, string> = { campus: "College / university name", partner: "Organisation name", workplace: "Company name" };

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [districts, setDistricts] = useState<string[]>([]);
  const [product, setProduct] = useState<ProductId | "">((productById(params.get("product"))?.id) || "");
  const [f, setF] = useState({ org_name: "", contact_name: "", designation: "", email: "", phone: "", district: "", size: "", ic: "", message: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { getMeta().then((m) => setDistricts(m.districts)).catch(() => {}); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const plan = productById(product);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return setErr("Choose a plan.");
    if (f.password.length < 8) return setErr("Password must be at least 8 characters.");
    if (f.password !== f.confirm) return setErr("Passwords do not match.");
    if (!agree) return setErr("Please accept the privacy commitment.");
    setBusy(true); setErr("");
    const body: RegisterIn = {
      product, org_name: f.org_name, contact_name: f.contact_name, designation: f.designation || undefined,
      email: f.email, phone: f.phone, district: f.district || undefined, size: f.size || undefined,
      has_internal_committee: f.ic ? f.ic === "yes" : undefined, message: f.message || undefined, password: f.password,
    };
    try {
      const { token } = await registerClient(body);
      setToken(token);
      router.push("/clients/dashboard?welcome=1");
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  };

  const input = "field";
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2"><p className="eyebrow">Client portal</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Register your institution</h1></div>
      <form onSubmit={submit} className="space-y-5 text-sm">
        <Card title="1. Choose your plan">
          <ProductPicker value={product} onChange={setProduct} showPrice />
          {plan && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-ink-soft marker:text-primary-container">{plan.includes.map((x) => <li key={x}>{x}</li>)}</ul>
          )}
        </Card>

        <Card title="2. Your institution">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="label">{product ? ORG_LABEL[product] : "Institution name"} *</span>
              <input required className={input} value={f.org_name} onChange={set("org_name")} /></label>
            <label><span className="label">District</span>
              <select className={input} value={f.district} onChange={set("district")}>
                <option value="">Select</option>{districts.map((d) => <option key={d}>{d}</option>)}<option>Outside Kerala</option>
              </select></label>
            <label><span className="label">{plan?.sizeLabel || "Size"}</span>
              <select className={input} value={f.size} onChange={set("size")}>
                <option value="">Select</option>{(plan?.sizes || []).map((x) => <option key={x}>{x}</option>)}
              </select></label>
            {product && product !== "partner" && (
              <label className="sm:col-span-2"><span className="label">Do you have an Internal Committee (POSH)?</span>
                <select className={input} value={f.ic} onChange={set("ic")}>
                  <option value="">Not sure</option><option value="yes">Yes</option><option value="no">No</option>
                </select></label>
            )}
          </div>
        </Card>

        <Card title="3. Contact person">
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="label">Full name *</span><input required className={input} value={f.contact_name} onChange={set("contact_name")} /></label>
            <label><span className="label">Designation</span><input className={input} placeholder="e.g. Principal, HR Manager" value={f.designation} onChange={set("designation")} /></label>
            <label><span className="label">Work email *</span><input required type="email" autoComplete="email" className={input} value={f.email} onChange={set("email")} /></label>
            <label><span className="label">Phone *</span><input required className={input} value={f.phone} onChange={set("phone")} /></label>
            <label className="sm:col-span-2"><span className="label">Anything we should know? (optional)</span>
              <textarea rows={3} className={input} value={f.message} onChange={set("message")} /></label>
          </div>
        </Card>

        <Card title="4. Create a password">
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="label">Password (min 8 characters) *</span><input required type="password" autoComplete="new-password" className={input} value={f.password} onChange={set("password")} /></label>
            <label><span className="label">Confirm password *</span><input required type="password" autoComplete="new-password" className={input} value={f.confirm} onChange={set("confirm")} /></label>
          </div>
          <label className="mt-4 flex items-start gap-2">
            <input type="checkbox" className="check mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="text-ink-soft">We understand that NariRaksha never shares the identity or conversations of people who use it. Reports to our institution are aggregate only.</span>
          </label>
        </Card>

        {err && <p className="text-red-600">{err}</p>}
        <button disabled={busy} className="btn-primary !min-h-12 w-full !text-base">
          {busy ? "Registering…" : `Register${plan ? ` for ${plan.name}` : ""}`}
        </button>
        <p className="text-center text-ink-soft">Already registered? <Link href="/clients/login" className="font-medium text-primary-container underline underline-offset-4">Log in</Link></p>
      </form>
    </div>
  );
}

export default function ClientRegisterPage() {
  return <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}><RegisterForm /></Suspense>;
}
