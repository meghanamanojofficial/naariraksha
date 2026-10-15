"use client";
import { useEffect, useState } from "react";
import { API, getHealth } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState("checking…");

  useEffect(() => {
    getHealth()
      .then(() => setStatus("connected ✅"))
      .catch(() => setStatus("not reachable ❌"));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">NariRaksha</h1>
      <p className="mt-2">Backend ({API}): {status}</p>
    </main>
  );
}
