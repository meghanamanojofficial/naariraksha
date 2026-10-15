export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getHealth(): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
