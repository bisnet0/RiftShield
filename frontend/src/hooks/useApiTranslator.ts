import {
  translateApiText,
  translateThreatCategory,
  translateRiskLevel,
  translateComponent,
  translateVulnerabilityTitle,
  translateStatus,
  translatePriority,
  translateSplit,
} from "../i18n/api-translations";
import { useLanguage } from "../context/LanguageContext";

export function useApiTranslator() {
  const { lang } = useLanguage();

  return {
    t: (text: string) => translateApiText(text, lang),
    threatCategory: (cat: string) => translateThreatCategory(cat, lang),
    riskLevel: (level: string) => translateRiskLevel(level, lang),
    component: (label: string) => translateComponent(label, lang),
    vulnTitle: (title: string) => translateVulnerabilityTitle(title, lang),
    status: (s: string) => translateStatus(s, lang),
    priority: (p: string) => translatePriority(p, lang),
    split: (s: string) => translateSplit(s, lang),
    lang,
  };
}
