import { API } from "./api";
import type { ProductId } from "./products";

export type Org = {
  id: number; product: ProductId; product_name: string; org_name: string; contact_name: string;
  designation: string | null; email: string; phone: string; district: string | null; size: string | null;
  has_internal_committee: boolean | null; message: string | null; status: string; created_at: string; last_login: string | null;
};

export type RegisterIn = {
  product: ProductId; org_name: string; contact_name: string; designation?: string; email: string; phone: string;
  district?: string; size?: string; has_internal_committee?: boolean; message?: string; password: string;
};

const KEY = "nr_client_token"; // client (institution) session only, never used on the victim side

export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t: string) => { try { localStorage.setItem(KEY, t); } catch {} };
export const logout = () => { try { localStorage.removeItem(KEY); } catch {} };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}/api/clients${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = body.detail;
    // FastAPI validation errors come as a list
    const msg = Array.isArray(d) ? d.map((e: { loc: string[]; msg: string }) => `${e.loc.at(-1)}: ${e.msg}`).join("; ") : d;
    throw new Error(msg || res.statusText);
  }
  return body as T;
}

export const registerClient = (b: RegisterIn) => call<{ token: string; org: Org }>("/register", { method: "POST", body: JSON.stringify(b) });
export const loginClient = (b: { product: ProductId; email: string; password: string }) =>
  call<{ token: string; org: Org }>("/login", { method: "POST", body: JSON.stringify(b) });
export const getMe = () => call<Org>("/me");
