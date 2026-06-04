import { Text } from "@chakra-ui/react";
import { useAppThemeFx } from "../styles/app-theme-fx";

export default function Settings() {
  const themeFx = useAppThemeFx();
  return <Text color={themeFx.textColor}>Configurações - Em construção</Text>;
}
