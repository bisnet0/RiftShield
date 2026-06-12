import api from "../../middleware/api";

export interface DetectedComponent {
  class_id: number;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface AnalyzeResponse {
  id: string;
  filename: string;
  status: string;
  components: DetectedComponent[];
  processing_time_ms: number | null;
  created_at: string;
}

export interface Threat {
  category: string;
  description: string;
  risk_level: string;
}

export interface Vulnerability {
  cve_id: string | null;
  title: string;
  description: string;
  cvss_score: number | null;
  cwe: string | null;
  affected_component: string;
}

export interface Countermeasure {
  title: string;
  description: string;
  priority: string;
  implementation_guide: string | null;
  references: string[];
}

export interface ComponentThreatAnalysis {
  component_label: string;
  component_class_id: number;
  stride_threats: Threat[];
  vulnerabilities: Vulnerability[];
  countermeasures: Countermeasure[];
}

export interface ThreatReport {
  id: string;
  inference_id: string;
  status: string;
  stride_summary: Record<string, number>;
  component_analyses: ComponentThreatAnalysis[];
  overall_risk_score: number | null;
  created_at: string;
  updated_at: string;
}

export const analyzeDiagram = async (file: File): Promise<AnalyzeResponse> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/inference/analyze", form);
  return res.data;
};

export const analyzeAndThreat = async (file: File): Promise<{ inference: AnalyzeResponse; threat_report: ThreatReport }> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/inference/analyze-threat", form);
  return res.data;
};

export const listReports = async (skip = 0, limit = 20): Promise<{ total: number; items: AnalyzeResponse[] }> => {
  const res = await api.get(`/inference/reports?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const getReport = async (id: string): Promise<AnalyzeResponse> => {
  const res = await api.get(`/inference/reports/${id}`);
  return res.data;
};

export const deleteReport = async (id: string): Promise<{ deleted: boolean }> => {
  const res = await api.delete(`/inference/reports/${id}`);
  return res.data;
};

export const listThreatReports = async (skip = 0, limit = 20): Promise<{ total: number; items: ThreatReport[] }> => {
  const res = await api.get(`/inference/threats?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const getThreatReport = async (inferenceId: string): Promise<ThreatReport> => {
  const res = await api.get(`/inference/threats/${inferenceId}`);
  return res.data;
};
