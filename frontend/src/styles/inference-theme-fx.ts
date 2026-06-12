import { useColorModeValue } from "@chakra-ui/react";

export const useInferenceThemeFx = () => ({
  cardBg: useColorModeValue("white", "gray.800"),
  cardBorder: useColorModeValue("gray.200", "gray.700"),
  cardShadow: useColorModeValue("md", "dark-lg"),
  badgeBg: useColorModeValue("orange.100", "orange.900"),
  badgeColor: useColorModeValue("orange.800", "orange.200"),
  riskCritical: useColorModeValue("red.500", "red.300"),
  riskHigh: useColorModeValue("orange.500", "orange.300"),
  riskMedium: useColorModeValue("yellow.500", "yellow.300"),
  riskLow: useColorModeValue("green.500", "green.300"),
});
