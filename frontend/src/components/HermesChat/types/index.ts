export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  has_attachment?: boolean;
  created_at?: string;
}

export interface ChatPayload {
  message: string;
  attachment: string | null;
}

export interface ChatResponse {
  response: string;
  msg_id: string;
}

export interface ChatHeaderProps {
  onClose: () => void;
}

export interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSoftDelete: (id: string) => void;
}

export interface ChatInputAreaProps {
  inputValue: string;
  attachment: string | null;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export interface ChatToggleButtonProps {
  onOpen: () => void;
}
