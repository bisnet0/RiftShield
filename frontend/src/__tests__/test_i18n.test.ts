import { describe, it, expect } from "vitest";

describe("i18n - pt-BR", () => {
  it("should have all required nav keys", async () => {
    const pt = (await import("../i18n/pt-BR")).default;
    const requiredKeys = [
      "nav.home", "nav.dashboard", "nav.inference", "nav.threats",
      "nav.dataset", "nav.training", "nav.vulnerabilities", "nav.countermeasures",
      "nav.compare", "nav.export", "nav.profile", "nav.settings", "nav.logout",
    ];
    requiredKeys.forEach((key) => {
      expect(pt[key]).toBeTruthy();
    });
  });

  it("should have dashboard keys", async () => {
    const pt = (await import("../i18n/pt-BR")).default;
    expect(pt["dash.title"]).toBe("Dashboard");
    expect(pt["dash.total_analises"]).toBe("Total de Análises");
  });
});

describe("i18n - en-US", () => {
  it("should have all required nav keys", async () => {
    const en = (await import("../i18n/en-US")).default;
    const requiredKeys = [
      "nav.home", "nav.dashboard", "nav.inference", "nav.threats",
      "nav.dataset", "nav.training", "nav.vulnerabilities", "nav.countermeasures",
      "nav.compare", "nav.export", "nav.profile", "nav.settings", "nav.logout",
    ];
    requiredKeys.forEach((key) => {
      expect(en[key]).toBeTruthy();
    });
  });

  it("should have equivalent keys as pt-BR", async () => {
    const [pt, en] = await Promise.all([
      import("../i18n/pt-BR"),
      import("../i18n/en-US"),
    ]);
    const ptKeys = Object.keys(pt.default).sort();
    const enKeys = Object.keys(en.default).sort();
    expect(ptKeys).toEqual(enKeys);
  });
});

describe("i18n - bilingual helpers", () => {
  it("should pickByLang return pt value for pt-BR", async () => {
    const { pickByLang } = await import("../i18n/bilingual");
    expect(pickByLang("Título", "Title", "pt-BR", "")).toBe("Título");
  });

  it("should pickByLang return en value for en-US", async () => {
    const { pickByLang } = await import("../i18n/bilingual");
    expect(pickByLang("Título", "Title", "en-US", "")).toBe("Title");
  });

  it("should pickByLang fallback to en when pt is null", async () => {
    const { pickByLang } = await import("../i18n/bilingual");
    expect(pickByLang(null, "Title", "pt-BR", "fallback")).toBe("Title");
  });

  it("should pickByLang return fallback when both null", async () => {
    const { pickByLang } = await import("../i18n/bilingual");
    expect(pickByLang(null, null, "pt-BR", "fallback")).toBe("fallback");
  });
});
