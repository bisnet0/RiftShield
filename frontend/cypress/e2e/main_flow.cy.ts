describe("Main Application Flow (E2E)", () => {
  beforeEach(() => {
    cy.session("auth", () => {
      cy.request({
        method: "POST",
        url: "http://localhost:3000/api/auth/login",
        body: { email: "test@riftshield.com", password: "test123" },
      }).then((resp) => {
        window.localStorage.setItem("accessToken", resp.body.access_token);
      });
    });
    cy.visit("http://localhost:1999/dashboard");
  });

  it("should navigate to all pages via sidebar", () => {
    const pages = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Análise de Diagramas", path: "/inference" },
      { label: "Dataset", path: "/dataset" },
      { label: "Treinamento", path: "/training" },
      { label: "Exportação", path: "/export" },
    ];

    pages.forEach((page) => {
      cy.contains(page.label).click();
      cy.url().should("include", page.path);
    });
  });

  it("should render dashboard stats", () => {
    cy.contains("Total de Análises").should("be.visible");
    cy.contains("Total de Ameaças").should("be.visible");
  });

  it("should open and close sidebar on mobile", () => {
    cy.viewport(375, 667);
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains("Exportação").should("be.visible");
    cy.get('[aria-label="Close"]').click();
  });

  it("should show usage time in sidebar", () => {
    cy.contains("Tempo de Uso").should("be.visible");
  });

  it("should toggle theme", () => {
    cy.get("header").within(() => {
      cy.get("button").eq(0).click();
    });
  });

  it("should open profile page", () => {
    cy.contains("Perfil").click();
    cy.url().should("include", "/profile");
    cy.contains("Informações Pessoais").should("be.visible");
  });

  it("should open settings page", () => {
    cy.contains("Configurações").click();
    cy.url().should("include", "/settings");
  });
});
