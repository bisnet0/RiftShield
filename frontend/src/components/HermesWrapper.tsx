import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";
import HermesChat from "./HermesChat/HermesChat";

export function HermesWrapper() {
  const { isAuthenticated } = useAuth();
  const [hermesEnabled] = useLocalStorage("hermes_enabled", true);

  if (!isAuthenticated || !hermesEnabled) return null;

  return <HermesChat />;
}
