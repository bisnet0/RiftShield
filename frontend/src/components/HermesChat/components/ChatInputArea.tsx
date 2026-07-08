import React from "react";
import { Flex, Input, IconButton } from "@chakra-ui/react";
import { Paperclip, Send } from "lucide-react";
import { useHermesThemeFx } from "../styles/theme-fx";
import { type ChatInputAreaProps } from "../types";

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputValue, attachment, isLoading, onInputChange, onFileChange, onSendMessage, onKeyPress,
}) => {
  const themeFx = useHermesThemeFx();
  return (
    <Flex p={4} bg={themeFx.inputAreaBg} borderTop="1px solid" borderColor={themeFx.borderColor} align="center">
      <input type="file" id="hermes-file-upload" style={{ display: "none" }} onChange={onFileChange} accept="image/*" />
      <IconButton
        as="label"
        htmlFor="hermes-file-upload"
        icon={<Paperclip size={18} />}
        variant="ghost"
        color={attachment ? themeFx.iconColor : themeFx.mutedText}
        mr={2}
        aria-label="Anexar arquivo"
        cursor="pointer"
        _hover={{ bg: "whiteAlpha.200" }}
      />
      <Input
        flex={1}
        placeholder="Pergunte ao Hermes sobre segurança, arquitetura..."
        color={themeFx.agentMsgText}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyPress}
        variant="filled"
        bg={themeFx.inputBg}
        _hover={{ bg: themeFx.inputBg }}
        _focus={{ bg: themeFx.inputBg, borderColor: themeFx.iconColor }}
        borderRadius="full"
      />
      <IconButton
        icon={<Send size={18} />}
        colorScheme="orange"
        bg="brand"
        color="white"
        isRound
        ml={2}
        onClick={onSendMessage}
        isLoading={isLoading}
        aria-label="Enviar"
        _hover={{ bg: "brandHover" }}
      />
    </Flex>
  );
};
