import { useColorModeValue } from "@chakra-ui/react";

export const useLoginThemeFx = () => {
  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.95)",
    "rgba(26, 26, 26, 0.9)",
  );
  const cardBorder = useColorModeValue(
    "rgba(230, 92, 0, 0.2)",
    "rgba(230, 184, 0, 0.2)",
  );

  const textColor = useColorModeValue("#1a1a1a", "#f5f5f0");
  const textMuted = useColorModeValue("#666666", "#6b6b6b");
  const linkColor = useColorModeValue("#e65c00", "#e6b800");

  return {
    cardBg,
    cardBorder,
    textColor,
    textMuted,
    linkColor,
  };
};
