import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useAuthForm } from "./hooks/useAuthForm";
import { AuthFields } from "./components/AuthFields";
import { AuthToggle } from "./components/AuthToggle";
import { useLoginThemeFx } from "./styles/theme-fx";

export const LoginForm: React.FC = () => {
  const { state, setters, actions } = useAuthForm();
  const themeFx = useLoginThemeFx();

  return (
    <Box
      w="full"
      maxW="md"
      bg={themeFx.cardBg}
      p={8}
      borderRadius="xl"
      boxShadow="xl"
      border="1px solid"
      borderColor={themeFx.cardBorder}
      backdropFilter="blur(16px)"
      transition="all 0.3s ease"
      mx="auto"
      mt={10}
    >
      <Box textAlign="center" mb={8}>
        <Heading fontSize="2xl" fontWeight="bold" color={themeFx.textColor}>
          {state.isLogin ? "RiftShield" : "Crie sua conta"}
        </Heading>
        <Text fontSize="md" color={themeFx.textMuted} mt={2}>
          {state.isLogin
            ? "Detecção de Ameaças"
            : "Preencha seus dados para começar"}
        </Text>
      </Box>

      <AuthFields state={state} setters={setters} actions={actions} />
      <AuthToggle isLogin={state.isLogin} onToggle={actions.toggleMode} />
    </Box>
  );
};
