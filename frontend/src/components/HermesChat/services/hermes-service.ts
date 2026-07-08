import api from "../../../middleware/api";
import { type Message, type ChatResponse, type ChatPayload } from "../types";

export const fetchChatHistory = async (): Promise<Message[]> => {
  const response = await api.get<Message[]>("/hermes/history");
  return response.data;
};

export const sendChatMessageApi = async (payload: ChatPayload): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>("/hermes/chat", payload);
  return response.data;
};

export const deleteMessageApi = async (messageId: string): Promise<void> => {
  await api.delete(`/hermes/messages/${messageId}`);
};
