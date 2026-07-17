import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ROUTES } from "../router/paths";

const PAGE_LABELS: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.PROFILE]: "Perfil",
  [ROUTES.SETTINGS]: "Configurações",
  [ROUTES.INFERENCE]: "Análise de Diagramas",
  [ROUTES.THREATS]: "Relatórios STRIDE",
  [ROUTES.DATASET]: "Dataset",
  [ROUTES.TRAINING]: "Treinamento",
  [ROUTES.VULNERABILITIES]: "Vulnerabilidades",
  [ROUTES.COUNTERMEASURES]: "Contramedidas",
};

const PAGE_LABELS_EN: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.PROFILE]: "Profile",
  [ROUTES.SETTINGS]: "Settings",
  [ROUTES.INFERENCE]: "Diagram Analysis",
  [ROUTES.THREATS]: "STRIDE Reports",
  [ROUTES.DATASET]: "Dataset",
  [ROUTES.TRAINING]: "Training",
  [ROUTES.VULNERABILITIES]: "Vulnerabilities",
  [ROUTES.COUNTERMEASURES]: "Countermeasures",
};

export function usePageLogger() {
  const location = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    const lang = localStorage.getItem("rift_lang") || "pt-BR";
    const labels = lang === "pt-BR" ? PAGE_LABELS : PAGE_LABELS_EN;
    const label = labels[path] || path.replace("/", "");

    if (label) {
      window.dispatchEvent(new CustomEvent("hermes-system-event", {
        detail: { type: "navigation", label: `Seção ${label} acessada`, icon: "activity" },
      }));
    }
  }, [location.pathname]);
}
