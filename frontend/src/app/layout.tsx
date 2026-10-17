import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Malayalam } from "next/font/google";
import { Asterisk, Gavel } from "lucide-react";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { LanguageProvider } from "@/lib/language";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const notoMl = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: ["400", "500", "600", "700"], variable: "--font-noto-ml", display: "swap" });

export const metadata: Metadata = {
  title: "NariRaksha",
  description: "Your safety. Your rights. Your voice.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${notoMl.variable}`}>
      <body className="min-h-screen font-sans text-ink antialiased">
        <LanguageProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-8 bg-surface-container-low/70">
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
              <div className="glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <a href="tel:112" className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary"><Asterisk size={24} /></span>
                  <span>
                    <span className="eyebrow text-secondary">Emergency</span>
                    <span className="block text-2xl font-bold text-primary-container">Dial 112</span>
                  </span>
                </a>
                <a href="tel:15100" className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary"><Gavel size={22} /></span>
                  <span>
                    <span className="eyebrow text-secondary">Free lawyer for every woman (NALSA)</span>
                    <span className="block text-2xl font-bold text-primary-container">15100</span>
                  </span>
                </a>
              </div>
              <div className="flex flex-col justify-between gap-3 text-xs text-ink-muted sm:flex-row">
                <p className="max-w-2xl">
                  NariRaksha gives general legal information, not legal advice. Every law shown comes from our checked legal library, not from the AI.
                  Need to leave fast? Tap <b>Quick exit</b> or press <b>Esc</b> twice.
                </p>
                <p>Free for every woman. Nothing you type is stored.</p>
              </div>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
