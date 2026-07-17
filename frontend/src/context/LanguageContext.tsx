import React, { createContext, useState, useEffect, useContext, useCallback, type ReactNode } from "react";
import api from "../middleware/api";

type Lang = "pt-BR" | "en-US";

interface LanguageContextData {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("rift_lang");
    if (saved === "pt-BR" || saved === "en-US") return saved;
    return navigator.language.startsWith("pt") ? "pt-BR" : "en-US";
  });
  const [dict, setDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("rift_lang", lang);
    setLoading(true);
    import(`../i18n/${lang}.ts`).then((mod) => {
      setDict(mod.default || mod);
      setLoading(false);
    }).catch(() => {
      import(`../i18n/en-US.ts`).then((mod) => {
        setDict(mod.default || mod);
        setLoading(false);
      });
    });
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      api.put("/users/me", { language: newLang });
    } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return dict[key] || key;
  }, [dict]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
