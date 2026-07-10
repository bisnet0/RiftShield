import { useState, useEffect, useRef, useCallback, type ChangeEvent, type KeyboardEvent } from "react";
import { fetchChatHistory, sendChatMessageApi, deleteMessageApi } from "../services/hermes-service";
import { type Message } from "../types";

export const useHermesChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  const notifyLog = () => {
    window.dispatchEvent(new CustomEvent("hermes-message"));
  };

  const loadHistory = async () => {
    try {
      const history = await fetchChatHistory();
      setMessages(history);
    } catch {
      console.error("Failed to load Hermes chat history");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !attachment) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      has_attachment: !!attachment,
    };
    setMessages((prev) => [...prev, newMsg]);

    const currentInput = inputValue;
    const currentAttachment = attachment;
    setInputValue("");
    setAttachment(null);
    setIsLoading(true);

    try {
      const data = await sendChatMessageApi({
        message: currentInput,
        attachment: currentAttachment,
      });
      const agentMsg: Message = {
        id: data.msg_id,
        role: "agent",
        content: data.response,
      };
      setMessages((prev) => [...prev, agentMsg]);
      notifyLog();
    } catch {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      notifyLog();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      await deleteMessageApi(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return {
    state: { isOpen, messages, inputValue, attachment, isLoading, messagesEndRef },
    setters: { setIsOpen, setInputValue, setAttachment, setIsLoading },
    actions: {
      handleFileChange,
      handleInputChange,
      handleSendMessage,
      handleKeyPress,
      handleSoftDelete,
      loadHistory,
    },
  };
};
