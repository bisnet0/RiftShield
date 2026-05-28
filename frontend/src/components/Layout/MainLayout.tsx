import React, { useState } from "react";
import {
  Box,
  Flex,
  Center,
  Spinner,
  Text,
  VStack,
  Heading,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { type AppMode } from "./nav-config";
import { useAppThemeFx } from "../../styles/app-theme-fx";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { LoginForm } from "../Auth/LoginForm";

export const MainLayout: React.FC = () => {
  const [mode, setMode] = useState<AppMode>("dashboard");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const themeFx = useAppThemeFx();
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <Center h="100vh" bg={themeFx.appBg} flexDirection="column" gap={4}>
        <Spinner size="xl" color="brand" thickness="4px" />
        <Text color={themeFx.textColor} fontWeight="bold">
          Carregando...
        </Text>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return (
      <Flex h="100vh" bg={themeFx.appBg} overflow="hidden">
        <Flex
          flex={1}
          direction="column"
          justify="center"
          align="center"
          p={{ base: 4, md: 8 }}
          overflowY="auto"
        >
          <VStack spacing={10} w="full" maxW="md">
            <VStack spacing={2} textAlign="center">
              <Heading
                as="h1"
                fontWeight="bold"
                fontSize={{ base: "3xl", md: "5xl" }}
                color={themeFx.textColor}
                letterSpacing="tight"
              >
                RiftShield
              </Heading>
              <Text color={themeFx.textMuted} fontSize="md">
                Plataforma de Diagnóstico
              </Text>
            </VStack>
            <LoginForm />
          </VStack>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg={themeFx.appBg} transition="background 0.2s">
      <Navbar onOpenSidebar={onOpen} />
      <Sidebar
        mode={mode}
        setMode={setMode}
        isOpen={isOpen}
        onClose={onClose}
      />

      <Flex
        flex={1}
        direction="column"
        ml={{ base: 0, md: "250px" }}
        w={{ base: "100%", md: "calc(100% - 250px)" }}
        pt="70px"
      >
        <Box
          as="main"
          flex={1}
          p={{ base: 4, md: 8 }}
          w="100%"
          overflowX="hidden"
        >
          {mode === "dashboard" && (
            <Text color={themeFx.textColor}>
              Dashboard - Em construção
            </Text>
          )}

          {mode === "profile" && (
            <Text color={themeFx.textColor}>
              Perfil - Em construção
            </Text>
          )}

          {mode === "settings" && (
            <Text color={themeFx.textColor}>
              Configurações - Em construção
            </Text>
          )}
        </Box>

        <Footer />
      </Flex>
    </Flex>
  );
};
