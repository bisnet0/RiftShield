import { LayoutDashboard, User, Settings, ScanSearch, ShieldAlert, Database, GraduationCap, Bug, ShieldCheck, Download, ArrowRightLeft } from "lucide-react";
import { ROUTES } from "../../router/paths";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { id: "inference", label: "Análise de Diagramas", icon: ScanSearch, path: ROUTES.INFERENCE },
  { id: "threats", label: "Relatórios STRIDE", icon: ShieldAlert, path: ROUTES.THREATS },
  { id: "dataset", label: "Dataset", icon: Database, path: ROUTES.DATASET },
  { id: "training", label: "Treinamento", icon: GraduationCap, path: ROUTES.TRAINING },
  { id: "vulnerabilities", label: "Vulnerabilidades", icon: Bug, path: ROUTES.VULNERABILITIES },
  { id: "countermeasures", label: "Contramedidas", icon: ShieldCheck, path: ROUTES.COUNTERMEASURES },
  { id: "compare", label: "Comparar Arquiteturas", icon: ArrowRightLeft, path: ROUTES.COMPARE },
  { id: "export", label: "Exportação", icon: Download, path: ROUTES.EXPORT },
  { id: "profile", label: "Perfil", icon: User, path: ROUTES.PROFILE },
  { id: "settings", label: "Configurações", icon: Settings, path: ROUTES.SETTINGS },
] as const;
