"use client";
import { PRODUCTS, type ProductId } from "@/lib/products";

export default function ProductPicker({ value, onChange, showPrice = false }: { value: ProductId | ""; onChange: (p: ProductId) => void; showPrice?: boolean }) {
  return (
    <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
      {PRODUCTS.map((p) => {
        const on = value === p.id;
        return (
          <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(p.id)}
            className={`rounded-xl border p-3 text-left text-sm transition ${on ? "border-rose-700 bg-rose-50 ring-2 ring-rose-300" : "border-slate-200 bg-white hover:border-rose-300"}`}>
            <span className="text-xl" aria-hidden>{p.icon}</span>
            <p className="mt-1 font-semibold text-rose-800">{p.name.replace("NariRaksha ", "")}</p>
            <p className="text-xs text-slate-500">{p.tagline}</p>
            {showPrice && <p className="mt-1 text-xs font-semibold text-rose-700">{p.price}</p>}
          </button>
        );
      })}
    </div>
  );
}
