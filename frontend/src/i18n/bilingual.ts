export function pickByLang<T extends string | null>(
  pt: T,
  en: T,
  lang: "pt-BR" | "en-US",
  fallback: string,
): string {
  if (lang === "pt-BR") return pt || en || fallback;
  return en || pt || fallback;
}
