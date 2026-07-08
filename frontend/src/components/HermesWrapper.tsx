import { useLocalStorage } from "../hooks/useLocalStorage";
import HermesChat from "./HermesChat/HermesChat";

export function HermesWrapper() {
  const [hermesEnabled] = useLocalStorage("hermes_enabled", true);

  if (!hermesEnabled) return null;

  return <HermesChat />;
}
