import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./paths";
import { MainLayout } from "../components/Layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Route>
    </Routes>
  );
}
