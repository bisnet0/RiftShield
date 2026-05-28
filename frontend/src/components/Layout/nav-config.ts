import { LayoutDashboard, User, Settings } from "lucide-react";

export type AppMode = "dashboard" | "profile" | "settings";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
] as const;
