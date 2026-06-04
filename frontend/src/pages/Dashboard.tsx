import { Text } from "@chakra-ui/react";
import { useAppThemeFx } from "../styles/app-theme-fx";

export default function Dashboard() {
  const themeFx = useAppThemeFx();
  return <Text color={themeFx.textColor}>Dashboard - Em construção</Text>;
}
