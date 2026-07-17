import api from "../middleware/api";

export interface TrainingLog {
  id: string;
  model_type: string;
  model_name: string;
  dataset_version: string;
  hyperparameters: Record<string, number>;
  metrics: { mAP50?: number; mAP50_95?: number; precision?: number; recall?: number; error?: string; train_images?: number; val_images?: number };
  model_path: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  train_images_count: number;
  val_images_count: number;
  classes_count: number;
  trained_filenames: string[];
  is_base_model: boolean;
}

export const startTraining = async (modelType = "yolov8n", epochs = 100): Promise<TrainingLog> => {
  const res = await api.post("/training/train", { model_type: modelType, epochs });
  return res.data;
};

export const fineTuneUpload = async (epochs = 10): Promise<TrainingLog> => {
  const res = await api.post("/training/fine-tune", { epochs });
  return res.data;
};

export const listModels = async (skip = 0, limit = 20): Promise<{ total: number; items: TrainingLog[] }> => {
  const res = await api.get(`/training/models?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const getModel = async (id: string): Promise<TrainingLog> => {
  const res = await api.get(`/training/models/${id}`);
  return res.data;
};

export const activateModel = async (modelPath: string): Promise<{ activated: boolean }> => {
  const res = await api.post("/training/models/activate", { model_path: modelPath });
  return res.data;
};
