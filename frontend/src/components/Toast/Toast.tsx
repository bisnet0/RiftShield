import React from "react";
import { Box, Flex, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { type ToastProps } from "./types";
import { TOAST_CONFIG } from "./utils/constants";
import { useToastThemeFx } from "./styles/theme-fx";
import { useToastAnimation } from "./hooks/useToastAnimation";
import { CloseButton } from "./components/CloseButton";

const Toast: React.FC<ToastProps> = ({
  title,
  message,
  type = "info",
  onClose = () => {},
  duration = 4000,
  isCloseable = true,
}) => {
  const effectiveDuration = isCloseable ? duration : 0;

  const { isVisible, triggerClose } = useToastAnimation(
    effectiveDuration,
    onClose,
  );
  const themeFx = useToastThemeFx();
  const styleConfig = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const borderColors: Record<string, string> = {
    success: useColorModeValue('rgba(34, 197, 94, 0.4)', 'rgba(74, 222, 128, 0.5)'),
    error: useColorModeValue('rgba(239, 68, 68, 0.4)', 'rgba(248, 113, 113, 0.5)'),
    info: useColorModeValue('rgba(59, 130, 246, 0.4)', 'rgba(96, 165, 250, 0.5)'),
    warning: useColorModeValue('rgba(234, 179, 8, 0.5)', 'rgba(250, 204, 21, 0.6)'),
  };
  const dynamicBorder = borderColors[type] || themeFx.cardBorder;

  return (
    <Box
      position="fixed"
      top="24px"
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Flex
        align="flex-start"
        gap={4}
        minW="340px"
        maxW="400px"
        p={5}
        borderRadius="xl"
        bg={themeFx.cardBg}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={dynamicBorder}
        boxShadow={themeFx.cardShadow}
        transform={
          isVisible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)"
        }
        opacity={isVisible ? 1 : 0}
        transition="all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
      >
        {/* Ícone com brilho Neon */}
        <Flex
          bg={styleConfig.iconBg}
          color={styleConfig.iconColor}
          minW="40px"
          h="40px"
          borderRadius="lg"
          align="center"
          justify="center"
          boxShadow={`0 0 15px ${styleConfig.iconBg}`}
        >
          {styleConfig.icon}
        </Flex>

        {/* Conteúdo de Texto */}
        <Flex flex={1} direction="column" justify="center" pt="2px">
          {title && (
            <Heading
              size="sm"
              mb={1}
              color={themeFx.titleColor}
              letterSpacing="0.02em"
            >
              {title}
            </Heading>
          )}
          <Text fontSize="sm" color={themeFx.messageColor} lineHeight="1.5">
            {message}
          </Text>
        </Flex>

        {/* Botão Fechar - Só renderiza se for closeable */}
        {isCloseable && <CloseButton onClick={triggerClose} />}
      </Flex>
    </Box>
  );
};

export default Toast;
