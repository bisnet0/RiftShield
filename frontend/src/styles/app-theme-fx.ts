import { useColorModeValue } from "@chakra-ui/react";

export const useAppThemeFx = () => {
  const appBg = useColorModeValue("#f5f0e8", "#0d0d0d");

  const headerBg = useColorModeValue(
    "rgba(245, 240, 232, 0.85)",
    "rgba(13, 13, 13, 0.85)",
  );
  const headerBorder = useColorModeValue(
    "rgba(230, 92, 0, 0.15)",
    "rgba(230, 184, 0, 0.15)",
  );
  const headerShadow = useColorModeValue("sm", "0 4px 20px rgba(0, 0, 0, 0.6)");

  const sidebarBg = useColorModeValue("#f5f0e8", "#0d0d0d");
  const footerBg = useColorModeValue("#f5f0e8", "#0d0d0d");

  const cardBg = useColorModeValue("#ffffff", "#1a1a1a");
  const cardBorder = useColorModeValue("rgba(230, 92, 0, 0.15)", "#333333");

  const textColor = useColorModeValue("#1a1a1a", "#f5f5f0");
  const textMuted = useColorModeValue("#6b6b6b", "#6b6b6b");

  const navActiveBg = useColorModeValue("rgba(230, 92, 0, 0.12)", "rgba(230, 184, 0, 0.15)");
  const navActiveColor = useColorModeValue("#e65c00", "#e6b800");
  const navHoverBg = useColorModeValue("rgba(230, 92, 0, 0.06)", "rgba(255,255,255,0.06)");

  const brandColor = useColorModeValue("#e65c00", "#e6b800");

  return {
    appBg,
    headerBg,
    headerBorder,
    headerShadow,
    sidebarBg,
    footerBg,
    cardBg,
    cardBorder,
    textColor,
    textMuted,
    navActiveBg,
    navActiveColor,
    navHoverBg,
    brandColor,
  };
};
