export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Law = {
  code: string; act: string; section: string; old_act: string | null; old_section: string | null;
  title: string; plain_en: string; cognizable: boolean | null; bailable: boolean | null;
  applies: "new" | "old"; citation: string; also_known_as: string | null; key?: boolean;
};
export type Authority = {
  id: number; name: string; level: "national" | "state" | "district"; district: string | null;
  type: string; phone: string | null; url: string | null; notes: string | null; verified: boolean;
};
export type LegalAid = {
  id: number; name: string; kind: string; district: string | null; specialisations: string[];
  languages: string[]; phone: string | null; email: string | null; url: string | null;
  free: boolean; verified: boolean; demo: boolean;
};
export type CrimeSummary = { slug: string; name: string; category: string; summary: string };
export type CrimeDetail = CrimeSummary & { evidence: string[]; documents: string[]; laws: Law[]; authorities: Authority[] };
export type Msg = { role: "user" | "assistant"; content: string };
export type Intake = { incident_date?: string; district?: string; is_minor: boolean; in_danger: boolean; relation_to_accused?: string };
export type ChatResult = {
  reply: string; next_steps: string[]; follow_up_questions: string[]; is_emergency: boolean;
  offline: boolean; offline_reason: string | null; recommended_authority: string | null;
  facts: Record<string, string | boolean | null> | null;
  crimes: { slug: string; name: string; category: string }[];
  laws: Law[]; evidence: string[]; documents: string[]; authorities: Authority[]; legal_aid: LegalAid[];
};

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : res.statusText);
  }
  return res.json();
}

const qs = (p: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : "";
};

export const getHealth = () => req<{ ok: boolean; llm: string }>("/health");
export const getMeta = () => req<{ districts: string[]; new_laws_from: string }>("/api/meta");
export const getCrimes = () => req<CrimeSummary[]>("/api/crimes");
export const getCrime = (slug: string, district?: string) => req<CrimeDetail>(`/api/crimes/${slug}${qs({ district })}`);
export const getAuthorities = (p: { level?: string; district?: string; type?: string }) => req<Authority[]>(`/api/authorities${qs(p)}`);
export const getLegalAid = (district?: string) => req<LegalAid[]>(`/api/legal-aid${qs({ district })}`);

export const chat = (messages: Msg[], intake: Intake, language: string) =>
  req<ChatResult>("/api/chat", { method: "POST", body: JSON.stringify({ messages, intake, language }) });

export type ComplaintIn = {
  crime_slug?: string; authority_type: string; language: string; name?: string; address?: string;
  incident_date?: string; incident_place?: string; description: string; accused?: string; witnesses?: string; evidence?: string;
};
export const draftComplaint = (body: ComplaintIn) =>
  req<{ text: string; citations: string[] }>("/api/complaint", { method: "POST", body: JSON.stringify(body) });

export async function downloadDocx(text: string, filename = "complaint") {
  const res = await fetch(`${API}/api/complaint/docx`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, filename }),
  });
  if (!res.ok) throw new Error("Could not create the Word file");
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: `${filename}.docx` });
  a.click();
  URL.revokeObjectURL(url);
}

export const requestCallback = (body: { name: string; phone: string; district?: string; language?: string; legal_aid_id?: number; consent: boolean }) =>
  req<{ ok: boolean }>("/api/callback", { method: "POST", body: JSON.stringify(body) });

export const TYPE_LABELS: Record<string, string> = {
  emergency: "Emergency", police: "Police", pink_police: "Pink Police", women_helpline: "Women helpline",
  cyber: "Cyber crime", legal_aid: "Legal aid", commission: "Women's commission", one_stop_centre: "One Stop Centre",
  protection_officer: "Protection Officer (DV)", posh_committee: "POSH committee", child_helpline: "Child helpline",
};
