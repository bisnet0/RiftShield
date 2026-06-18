import api from "../middleware/api";

export interface DashboardStats {
  total_analyses: number;
  total_threats: number;
  completed_analyses: number;
  failed_analyses: number;
  total_components_analyzed: number;
  threats_by_risk: { critical: number; high: number; medium: number; low: number };
  stride_distribution: Record<string, number>;
  top_components: { label: string; count: number }[];
  recent_analyses: { id: string; filename: string; status: string; components_count: number; created_at: string | null }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/dashboard/stats");
  return res.data;
};
