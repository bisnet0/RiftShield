import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./paths";
import { MainLayout } from "../components/Layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import InferencePage from "../pages/InferencePage";
import ThreatsPage from "../pages/ThreatsPage";
import DatasetPage from "../pages/DatasetPage";
import TrainingPage from "../pages/TrainingPage";
import VulnerabilitiesPage from "../pages/VulnerabilitiesPage";
import CountermeasuresPage from "../pages/CountermeasuresPage";
import ExportPage from "../pages/ExportPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={ROUTES.INFERENCE} element={<InferencePage />} />
        <Route path={ROUTES.THREATS} element={<ThreatsPage />} />
        <Route path={ROUTES.DATASET} element={<DatasetPage />} />
        <Route path={ROUTES.TRAINING} element={<TrainingPage />} />
        <Route path={ROUTES.VULNERABILITIES} element={<VulnerabilitiesPage />} />
        <Route path={ROUTES.COUNTERMEASURES} element={<CountermeasuresPage />} />
        <Route path={ROUTES.EXPORT} element={<ExportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
