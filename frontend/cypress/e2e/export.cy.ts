describe("Export Flow (E2E)", () => {
  beforeEach(() => {
    cy.session("auth", () => {
      cy.request({
        method: "POST",
        url: "http://localhost:3000/api/auth/login",
        body: { email: "test@riftshield.com", password: "test123" },
      });
    });
    cy.visit("http://localhost:1999/export");
  });

  it("should render export page", () => {
    cy.contains("Seções para Exportar").should("be.visible");
    cy.contains("Formato e Opções").should("be.visible");
  });

  it("should have all sections checked by default", () => {
    cy.get('input[type="checkbox"]').should("have.length.at.least", 6);
    cy.get('input[type="checkbox"]').each(($el) => {
      cy.wrap($el).should("be.checked");
    });
  });

  it("should select different export formats", () => {
    const formats = ["CSV", "Excel", "PDF"];
    formats.forEach((fmt) => {
      cy.get("select").first().select(fmt);
      cy.get("select").first().should("have.value", fmt.toLowerCase());
    });
  });

  it("should toggle zip option", () => {
    cy.get('[role="switch"]').click();
    cy.get('[role="switch"]').should("have.attr", "aria-checked", "true");
  });

  it("should show warning when no section selected", () => {
    cy.get('input[type="checkbox"]').uncheck();
    cy.get("button").contains("Exportar Dados").click();
    cy.contains("Selecione ao menos").should("be.visible");
  });
});
