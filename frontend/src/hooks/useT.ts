import { useLanguage } from "../context/LanguageContext";

export function useT() {
  const { t } = useLanguage();
  return t;
}
