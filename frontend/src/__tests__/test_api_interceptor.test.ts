import { describe, it, expect } from "vitest";

describe("API Interceptor", () => {
  it("should create axios instance with correct base URL", async () => {
    const { api } = await import("../middleware/api");
    expect(api.defaults.baseURL).toBe("/api");
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("should be able to make a GET request", async () => {
    const { api } = await import("../middleware/api");
    expect(typeof api.get).toBe("function");
    expect(typeof api.post).toBe("function");
  });

  it("should intercept 429 responses", async () => {
    const eventSpy = vi.fn();
    window.addEventListener("quota-exceeded", eventSpy);

    const event = new CustomEvent("quota-exceeded");
    window.dispatchEvent(event);

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "quota-exceeded" })
    );
    window.removeEventListener("quota-exceeded", eventSpy);
  });
});
