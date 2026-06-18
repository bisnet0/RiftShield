import api from "../middleware/api";

export interface DatasetEntry {
  id: string;
  filename: string;
  labels: { class_id: number; label: string; x_center: number; y_center: number; width: number; height: number }[];
  source: string;
  split: string;
  augmented: boolean;
  image_width: number;
  image_height: number;
  created_at: string;
}

export interface DatasetStats {
  total: number;
  train_count: number;
  val_count: number;
  test_count: number;
  manual_count: number;
  augmented_count: number;
  label_distribution: Record<string, number>;
}

export const uploadEntry = async (file: File, labels: string, split = "train"): Promise<DatasetEntry> => {
  const form = new FormData();
  form.append("file", file);
  form.append("labels", labels);
  form.append("split", split);
  const res = await api.post("/dataset/upload", form);
  return res.data;
};

export const listEntries = async (split = "", source = "", skip = 0, limit = 50): Promise<{ total: number; items: DatasetEntry[] }> => {
  const params = new URLSearchParams();
  if (split) params.append("split", split);
  if (source) params.append("source", source);
  params.append("skip", String(skip));
  params.append("limit", String(limit));
  const res = await api.get(`/dataset/entries?${params}`);
  return res.data;
};

export const deleteEntry = async (id: string): Promise<{ deleted: boolean }> => {
  const res = await api.delete(`/dataset/entries/${id}`);
  return res.data;
};

export const augmentEntry = async (id: string): Promise<{ total: number; items: DatasetEntry[] }> => {
  const res = await api.post(`/dataset/entries/${id}/augment`);
  return res.data;
};

export const getDatasetStats = async (): Promise<DatasetStats> => {
  const res = await api.get("/dataset/stats");
  return res.data;
};
