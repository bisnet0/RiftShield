import { Text } from "@chakra-ui/react";
import { useAppThemeFx } from "../styles/app-theme-fx";

export default function Profile() {
  const themeFx = useAppThemeFx();
  return <Text color={themeFx.textColor}>Perfil - Em construção</Text>;
}
