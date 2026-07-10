import React from "react";
import { Flex, HStack, Avatar, VStack, Text, IconButton, Badge } from "@chakra-ui/react";
import { Shield, X } from "lucide-react";
import { useHermesThemeFx } from "../styles/theme-fx";
import { type ChatHeaderProps } from "../types";

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  const themeFx = useHermesThemeFx();
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
        <Avatar size="sm" name="Hermes" bg="orange.600" color="white" icon={<Shield size={16} />} />
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight="bold" fontSize="md">Hermes</Text>
          <HStack>
            <Text fontSize="xs" color="whiteAlpha.700">Arquiteto de Sistemas</Text>
            <Badge size="sm" colorScheme="green" variant="solid" fontSize="2xs" borderRadius="full" px={1.5}>IA</Badge>
          </HStack>
        </VStack>
      </HStack>
      <IconButton
        icon={<X size={18} />}
        variant="ghost"
        color={themeFx.headerText}
        _hover={{ bg: "whiteAlpha.200" }}
        onClick={onClose}
        aria-label="Fechar"
        size="sm"
      />
    </Flex>
  );
};
