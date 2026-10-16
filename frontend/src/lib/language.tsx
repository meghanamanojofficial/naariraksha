"use client";
import { createContext, useContext, useEffect, useState } from "react";

// The language she wants replies, voice input and complaint drafts in. Kept in sessionStorage only,
// so Quick Exit (which clears sessionStorage) also forgets it.
export type Language = "English" | "Malayalam";
const KEY = "nr_lang";

const Ctx = createContext<{ language: Language; setLanguage: (l: Language) => void }>({
  language: "English",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>("English");

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) === "Malayalam") setLang("Malayalam"); } catch {}
  }, []);

  const setLanguage = (l: Language) => {
    setLang(l);
    try { sessionStorage.setItem(KEY, l); } catch {}
  };

  return <Ctx.Provider value={{ language, setLanguage }}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
