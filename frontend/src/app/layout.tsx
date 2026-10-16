import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import QuickExit from "@/components/QuickExit";

export const metadata: Metadata = {
  title: "NariRaksha",
  description: "Your safety. Your rights. Your voice.",
};

const NAV = [
  { href: "/help", label: "Get help" },
  { href: "/crimes", label: "Know your rights" },
  { href: "/complaint", label: "Draft complaint" },
  { href: "/directory", label: "Helplines" },
  { href: "/legal-aid", label: "Legal aid" },
  { href: "/products", label: "Products" },
  { href: "/clients", label: "Clients" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-rose-50/40 text-slate-800 antialiased">
        <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/95 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <Link href="/" className="text-lg font-bold text-rose-700">NariRaksha</Link>
            {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-rose-700">{n.label}</Link>)}
            <span className="ml-auto" />
            <QuickExit />
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-slate-500">
          NariRaksha gives general legal information, not legal advice. In danger? Call <b>112</b>. Women can get a free lawyer: <b>15100</b>.
        </footer>
      </body>
    </html>
  );
}
