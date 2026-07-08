import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useHermesChat } from "./hooks/useHermesChat";
import { ChatToggleButton } from "./components/ChatToggleButton";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatInputArea } from "./components/ChatInputArea";
import { useHermesThemeFx } from "./styles/theme-fx";

const HermesChat: React.FC = () => {
  const { state, setters, actions } = useHermesChat();
  const themeFx = useHermesThemeFx();

  if (!state.isOpen) {
    return <ChatToggleButton onOpen={() => setters.setIsOpen(true)} />;
  }

  return (
    <Box
      position="fixed"
      bottom="20px"
      right={{ base: "10px", md: "20px" }}
      zIndex={1000}
      animation="fade-in 0.3s"
    >
      <Flex
        w={{ base: "calc(100vw - 20px)", md: "420px", lg: "480px" }}
        height={{ base: "calc(100vh - 100px)", md: "620px" }}
        flexDirection="column"
        borderRadius="xl"
        bg={themeFx.containerBg}
        boxShadow="0 20px 40px -4px rgba(0, 0, 0, 0.4)"
        overflow="hidden"
        border="1px solid"
        borderColor={themeFx.borderColor}
        backdropFilter="blur(20px)"
      >
        <ChatHeader onClose={() => setters.setIsOpen(false)} />
        <ChatMessageList
          messages={state.messages}
          isLoading={state.isLoading}
          messagesEndRef={state.messagesEndRef}
          onSoftDelete={actions.handleSoftDelete}
        />
        <ChatInputArea
          inputValue={state.inputValue}
          attachment={state.attachment}
          isLoading={state.isLoading}
          onInputChange={actions.handleInputChange}
          onFileChange={actions.handleFileChange}
          onSendMessage={actions.handleSendMessage}
          onKeyPress={actions.handleKeyPress}
        />
      </Flex>
    </Box>
  );
};

export default HermesChat;
