import { useEffect } from "react";
import { useToast } from "./Toast/components/ToastContext";

export function QuotaWatcher() {
  const { showToast } = useToast();

  useEffect(() => {
    const handler = () => {
      showToast({
        title: "Cota da IA excedida",
        message: "O limite gratuito do provedor de IA foi atingido. As funcionalidades que usam IA podem ficar temporariamente indisponíveis. Tente novamente mais tarde ou configure outra chave de API.",
        type: "warning",
        duration: 8000,
      });
    };
    window.addEventListener("quota-exceeded", handler);
    return () => window.removeEventListener("quota-exceeded", handler);
  }, [showToast]);

  return null;
}
