import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteLanguage = "en" | "bn";

type LanguageContextValue = {
  language: SiteLanguage;
  toggleLanguage: () => void;
  setLanguage: (lang: SiteLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const queryLanguage = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("lang") : null;
  const forcedLanguage: SiteLanguage | null = queryLanguage === "bn" || queryLanguage === "en" ? queryLanguage : null;
  const [storedLanguage, setStoredLanguage] = useState<SiteLanguage>(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("pujoparikroma-language") === "en" ? "en" : "bn";
    }
    return "bn";
  });
  const language = forcedLanguage ?? storedLanguage;

  useEffect(() => {
    if (!forcedLanguage && typeof localStorage !== "undefined") {
      localStorage.setItem("pujoparikroma-language", storedLanguage);
    }
    document.documentElement.lang = language === "bn" ? "bn" : "en";
    document.documentElement.dataset.siteLanguage = language;
  }, [forcedLanguage, language, storedLanguage]);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () => setStoredLanguage((current) => (current === "en" ? "bn" : "en")),
      setLanguage: (lang: SiteLanguage) => setStoredLanguage(lang),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
