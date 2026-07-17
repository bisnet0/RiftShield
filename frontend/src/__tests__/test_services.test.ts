import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../middleware/api", () => ({ default: mockApi }));

describe("Inference Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list reports", async () => {
    const mockReports = [{ id: "1", filename: "test.png", status: "completed" }];
    mockApi.get.mockResolvedValue({ data: { total: 1, items: mockReports } });

    const { listReports } = await import("../services/inference-service");
    const result = await listReports();

    expect(mockApi.get).toHaveBeenCalledWith("/inference/reports?skip=0&limit=20");
    expect(result.items).toEqual(mockReports);
  });

  it("should get report by id", async () => {
    const mockReport = { id: "1", filename: "test.png", status: "completed" };
    mockApi.get.mockResolvedValue({ data: mockReport });

    const { getReport } = await import("../services/inference-service");
    const result = await getReport("1");

    expect(mockApi.get).toHaveBeenCalledWith("/inference/reports/1");
    expect(result).toEqual(mockReport);
  });

  it("should list threat reports", async () => {
    mockApi.get.mockResolvedValue({ data: { total: 0, items: [] } });

    const { listThreatReports } = await import("../services/inference-service");
    const result = await listThreatReports();

    expect(mockApi.get).toHaveBeenCalledWith("/inference/threats?skip=0&limit=20");
  });

  it("should analyze diagram", async () => {
    mockApi.post.mockResolvedValue({ data: { id: "inf123", status: "completed" } });

    const { analyzeDiagram } = await import("../services/inference-service");
    const file = new File(["test"], "test.png", { type: "image/png" });
    const result = await analyzeDiagram(file);

    expect(mockApi.post).toHaveBeenCalledWith("/inference/analyze", expect.any(FormData));
    expect(result.status).toBe("completed");
  });
});

describe("Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch dashboard stats", async () => {
    const mockStats = { total_analyses: 10, total_threats: 5 };
    mockApi.get.mockResolvedValue({ data: mockStats });

    const { getDashboardStats } = await import("../services/dashboard-service");
    const result = await getDashboardStats();

    expect(mockApi.get).toHaveBeenCalledWith("/dashboard/stats");
    expect(result).toEqual(mockStats);
  });
});

describe("Dataset Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list dataset entries", async () => {
    mockApi.get.mockResolvedValue({ data: { total: 0, items: [] } });

    const { listEntries } = await import("../services/dataset-service");
    const result = await listEntries();

    expect(mockApi.get).toHaveBeenCalledWith("/dataset/entries?skip=0&limit=50");
    expect(result.items).toEqual([]);
  });

  it("should delete dataset entry", async () => {
    mockApi.delete.mockResolvedValue({ data: { ok: true } });

    const { deleteEntry } = await import("../services/dataset-service");
    const result = await deleteEntry("entry123");

    expect(mockApi.delete).toHaveBeenCalledWith("/dataset/entries/entry123");
    expect(result.ok).toBe(true);
  });
});

describe("Knowledge Base Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list vulnerabilities", async () => {
    mockApi.get.mockResolvedValue({ data: { total: 0, items: [] } });

    const { listVulnerabilities } = await import("../services/kb-service");
    const result = await listVulnerabilities({ search: "sql" });

    expect(mockApi.get).toHaveBeenCalledWith("/kb/vulnerabilities?search=sql&skip=0&limit=50");
    expect(result.items).toEqual([]);
  });

  it("should list countermeasures", async () => {
    mockApi.get.mockResolvedValue({ data: { total: 0, items: [] } });

    const { listCountermeasures } = await import("../services/kb-service");
    const result = await listCountermeasures("sql-injection");

    expect(mockApi.get).toHaveBeenCalledWith("/kb/countermeasures?cwe=sql-injection&skip=0&limit=50");
    expect(result.items).toEqual([]);
  });
});
