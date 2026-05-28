import React, { createContext, useContext, useState, useCallback } from "react";
import { useToast as useChakraToast } from "@chakra-ui/react";

interface ToastContextData {
  showToast: (props: { title?: string; message: string; type?: "success" | "error" | "info" }) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const chakraToast = useChakraToast();

  const showToast = useCallback(
    ({ title, message, type = "info" }: { title?: string; message: string; type?: "success" | "error" | "info" }) => {
      chakraToast({
        title,
        description: message,
        status: type,
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    },
    [chakraToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
