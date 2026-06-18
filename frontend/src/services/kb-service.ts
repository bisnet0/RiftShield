import api from "../middleware/api";

export interface KBVulnerability {
  id: string;
  cve_id: string | null;
  title: string;
  description: string;
  cvss_score: number | null;
  cwe: string | null;
  affected_components: string[];
  tags: string[];
  created_at: string;
}

export interface KBCountermeasure {
  id: string;
  title: string;
  description: string;
  priority: string;
  implementation_guide: string | null;
  references: string[];
  vulnerability_cwe_ids: string[];
  created_at: string;
}

export const listVulnerabilities = async (params?: {
  component?: string;
  cwe?: string;
  min_cvss?: number;
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<{ total: number; items: KBVulnerability[] }> => {
  const sp = new URLSearchParams();
  if (params?.component) sp.append("component", params.component);
  if (params?.cwe) sp.append("cwe", params.cwe);
  if (params?.min_cvss) sp.append("min_cvss", String(params.min_cvss));
  if (params?.search) sp.append("search", params.search);
  sp.append("skip", String(params?.skip ?? 0));
  sp.append("limit", String(params?.limit ?? 50));
  const res = await api.get(`/kb/vulnerabilities?${sp}`);
  return res.data;
};

export const listCountermeasures = async (cwe = "", skip = 0, limit = 50): Promise<{ total: number; items: KBCountermeasure[] }> => {
  const sp = new URLSearchParams();
  if (cwe) sp.append("cwe", cwe);
  sp.append("skip", String(skip));
  sp.append("limit", String(limit));
  const res = await api.get(`/kb/countermeasures?${sp}`);
  return res.data;
};
