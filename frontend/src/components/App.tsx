import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { AppRouter } from "../router";
import { ToastProvider } from "../components/Toast/components/ToastContext";
import { HermesWrapper } from "./HermesWrapper";
import { TestToast } from "./Toast/TestToast";
import { QuotaWatcher } from "./QuotaWatcher";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <AppRouter />
            <HermesWrapper />
          <TestToast />
          <QuotaWatcher />
        </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
