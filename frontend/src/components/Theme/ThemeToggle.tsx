import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <IconButton
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      icon={isDark ? <FiSun /> : <FiMoon />}
      onClick={toggleColorMode}
      variant="ghost"
      bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
      color={isDark ? "yellow.400" : "#e65c00"}
      fontSize="20px"
      mr={3}
      _hover={{
        bg: isDark ? "whiteAlpha.200" : "blackAlpha.100",
      }}
      isRound
    />
  );
}
