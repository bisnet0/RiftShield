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
  Image,
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
            <Flex align="center" justify="center" gap={4} w="full">
               <Image
                src="/public/Rift_Shield_Logo.png"
                alt="Rift Shield Logo"
                w={{ base: "80px", md: "110px" }} // Tamanho ajustado para parear com o texto
                dropShadow="lg"
              />
              <Flex direction="column" align="flex-start" justify="center">
                <Text
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "sm", md: "lg" }}
                  color={themeFx.textColor}
                  mb="-1"
                >
                  Proteja seu ambiente com
                </Text>

                <Heading
                  as="h1"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="100"
                  fontSize={{ base: "4xl", md: "5xl" }}
                  color={themeFx.textColor}
                  letterSpacing="tight"
                  lineHeight="1"
                  display="flex"
                  alignItems="baseline"
                  gap={2}
                >
                 Rift{" "}
                  <Text
                    as="span"
                    fontWeight="bold"
                    color="yellow"
                    fontSize={{ base: "3xl", md: "5xl" }}
                  >
                    Shield
                  </Text>
                </Heading>
              </Flex>
            </Flex>

            {/* O Card do Login */}
            <LoginForm />
          </VStack>
        </Flex>
        {/* LADO DIREITO: Imagem Hero */}
        <Box
          display={{ base: "none", lg: "block" }}
          flex={1}
          bg="gray.900"
          position="relative"
        >
          <Image
            src="/public/Rift_Shield_Hero.png"
            alt="Login Hero"
            objectFit="cover"
            w="full"
            h="full"
          />
        </Box>
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
