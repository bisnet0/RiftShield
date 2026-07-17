import { Flex, HStack, Text, IconButton, Icon, Image, Box } from "@chakra-ui/react";
import { UserCircle, LogOut, Menu } from "lucide-react";
import ThemeToggle from "../Theme/ThemeToggle";
import { useAppThemeFx } from "../../styles/app-theme-fx";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../router/paths";
import { LanguageToggle } from "../LanguageToggle";
import { UsageTimer } from "../UsageTimer";


interface Props {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenSidebar }) => {
  const themeFx = useAppThemeFx();
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      left={0}
      w="100%"
      h="70px"
      zIndex={1000}
      bg={themeFx.headerBg}
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor={themeFx.headerBorder}
      boxShadow={themeFx.headerShadow}
      px={{ base: 4, md: 6 }}
      align="center"
      justify="space-between"
    >
      <HStack spacing={4}>
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onOpenSidebar}
          variant="ghost"
          aria-label="Abrir menu"
          icon={<Menu size={24} color={themeFx.textColor} />}
        />

        <Flex align="center" cursor="pointer" onClick={() => navigate(isAuthenticated ? ROUTES.DASHBOARD : "/")} title="Início">
          <Image
            src="/public/Rift_Shield_Logo.png"
            alt="Logo"
            w="36px"
            mr={3}
          />
          <Text
            fontSize="xl"
            fontWeight="light"
            color={themeFx.textColor}
            letterSpacing="tight"
          >
            Rift
          </Text>
          <Text
            marginLeft={1}
            fontSize="xl"
            fontWeight="bold"
            color={themeFx.brandColor}
            letterSpacing="tight"
          >
            Shield
          </Text>
        </Flex>
      </HStack>

      <HStack spacing={{ base: 2, md: 4 }}>
        <ThemeToggle />

        <LanguageToggle />

        <HStack
          as="button"
          onClick={() => navigate(ROUTES.PROFILE)}
          color={themeFx.textColor}
          display={{ base: "none", md: "flex" }}
          bg={themeFx.navHoverBg}
          px={3}
          py={1.5}
          borderRadius="full"
          cursor="pointer"
          _hover={{ bg: "blackAlpha.200" }}
          transition="all 0.2s"
        >
          <Icon as={UserCircle} boxSize={4} />
          <Text fontSize="sm" fontWeight="medium">
            {user?.name || "Usuário"}
          </Text>
        </HStack>

        <IconButton
          aria-label="Sair"
          icon={<Icon as={LogOut} boxSize={5} />}
          variant="ghost"
          colorScheme="red"
          size="sm"
          isRound
          onClick={signOut}
          title="Sair"
        />
      </HStack>
    </Flex>
  );
};
