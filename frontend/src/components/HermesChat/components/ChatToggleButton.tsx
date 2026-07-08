import React from "react";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { Bot } from "lucide-react";
import { type ChatToggleButtonProps } from "../types";

export const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({ onOpen }) => (
  <Tooltip label="Abrir Hermes" placement="left">
    <IconButton
      icon={<Bot size={24} />}
      colorScheme="orange"
      bg="brand"
      color="white"
      size="lg"
      isRound
      position="fixed"
      bottom="20px"
      right="20px"
      boxShadow="0 4px 20px rgba(230, 92, 0, 0.4)"
      onClick={onOpen}
      aria-label="Abrir Hermes"
      zIndex={1000}
      _hover={{ transform: "scale(1.1)", bg: "brandHover" }}
      transition="all 0.2s"
    />
  </Tooltip>
);
