"use client";
import { Gavel, Lock, Phone, ShieldAlert, Siren, Smartphone, X } from "lucide-react";
import { useEffect } from "react";

// Same national numbers as backend/app/seed_data/authorities.json (all verified there).
const CONTACTS = [
  { phone: "112", name: "Emergency (police, fire, ambulance)", icon: Siren, urgent: true },
  { phone: "181", name: "Women Helpline (Mitra 181 in Kerala)", icon: Phone },
  { phone: "1930", name: "Cyber crime helpline", icon: Smartphone },
  { phone: "15100", name: "Free legal aid (NALSA)", icon: Gavel },
];

export default function SafetyCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-md" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="safety-title" onClick={(e) => e.stopPropagation()}
        className="glass-strong relative w-full max-w-md space-y-4 p-6 text-ink">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="icon-badge h-9 w-9"><ShieldAlert size={18} /></span>
            <h2 id="safety-title" className="text-lg font-bold text-primary">Safety &amp; privacy</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink-soft">
          NariRaksha does not ask you to sign up and does not store what you tell it. Your chat stays in this browser tab only.
        </p>
        <div className="tile space-y-1 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold"><Lock size={14} /> Quick exit</span>
            <span className="chip">Always on</span>
          </div>
          <p className="text-sm text-ink-soft">
            Tap <b className="text-ink">Quick exit</b> or press <b className="text-ink">Esc twice</b>. It clears this tab&apos;s data and opens a weather search, and Back won&apos;t return here.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow text-secondary">Call now</p>
          {CONTACTS.map(({ phone, name, icon: Icon, urgent }) => (
            <a key={phone} href={`tel:${phone}`}
              className={`flex items-center justify-between rounded-2xl p-3 transition ${urgent ? "bg-red-600 text-white hover:bg-red-700" : "bg-surface-container-low hover:bg-surface-container"}`}>
              <span className="flex items-center gap-3 text-sm font-semibold"><Icon size={18} className={urgent ? "" : "text-primary-container"} /> {name}</span>
              <span className={`text-lg font-bold ${urgent ? "" : "text-primary-container"}`}>{phone}</span>
            </a>
          ))}
        </div>
        <button onClick={onClose} className="btn-primary w-full">Close</button>
      </div>
    </div>
  );
}
