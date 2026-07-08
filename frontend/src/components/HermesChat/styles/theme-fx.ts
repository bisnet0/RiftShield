import { useColorModeValue } from "@chakra-ui/react";

export const useHermesThemeFx = () => {
  const containerBg = useColorModeValue("rgba(245, 240, 232, 0.95)", "rgba(13, 13, 13, 0.95)");
  const borderColor = useColorModeValue("rgba(230, 92, 0, 0.2)", "rgba(230, 184, 0, 0.2)");
  const headerBg = useColorModeValue("#1a1a1a", "#1a1a1a");
  const headerText = useColorModeValue("#f5f5f0", "#f5f5f0");
  const userMsgBg = useColorModeValue("#e65c00", "#e6b800");
  const userMsgText = useColorModeValue("white", "black");
  const agentMsgBg = useColorModeValue("#ffffff", "#1a1a1a");
  const agentMsgText = useColorModeValue("#1a1a1a", "#f5f5f0");
  const mutedText = useColorModeValue("#6b6b6b", "#6b6b6b");
  const iconColor = useColorModeValue("#e65c00", "#e6b800");
  const inputAreaBg = useColorModeValue("rgba(245, 240, 232, 0.8)", "rgba(13, 13, 13, 0.8)");
  const inputBg = useColorModeValue("white", "#2a2a2a");

  return {
    containerBg,
    borderColor,
    headerBg,
    headerText,
    userMsgBg,
    userMsgText,
    agentMsgBg,
    agentMsgText,
    mutedText,
    iconColor,
    inputAreaBg,
    inputBg,
  };
};
