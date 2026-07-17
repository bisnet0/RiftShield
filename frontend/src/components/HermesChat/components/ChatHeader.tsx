import React from "react";
import { Flex, HStack, VStack, Text, IconButton, Badge, useColorModeValue, Image } from "@chakra-ui/react";
import { X } from "lucide-react";
import { useT } from "../../../hooks/useT";
import { useHermesThemeFx } from "../styles/theme-fx";
import { type ChatHeaderProps } from "../types";

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  const themeFx = useHermesThemeFx();
  const t = useT();
  const iaBadgeBg = useColorModeValue("#e65c00", "#e6b800");
  return (
    <Flex
      bg={themeFx.headerBg}
      color={themeFx.headerText}
      p={4}
      align="center"
      justify="space-between"
      borderBottom="1px solid"
      borderColor={themeFx.borderColor}
    >
      <HStack>
        <Image src="/hermes.png" alt="Hermes" w="50px" h="50px" borderRadius="full" objectFit="cover" />
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight="bold" fontSize="md">{t("hermes.titulo")}</Text>
          <HStack>
            <Text fontSize="xs" color="whiteAlpha.700">{t("hermes.subtitulo")}</Text>
            <Badge size="sm" bg={iaBadgeBg} color="white" fontSize="2xs" borderRadius="full" px={1.5}>IA</Badge>
          </HStack>
        </VStack>
      </HStack>
      <IconButton
        icon={<X size={18} />}
        variant="ghost"
        color={themeFx.headerText}
        _hover={{ bg: "whiteAlpha.200" }}
        onClick={onClose}
        aria-label={t("hermes.fechar")}
        size="sm"
      />
    </Flex>
  );
};
