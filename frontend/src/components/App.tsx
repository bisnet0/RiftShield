import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { AppRouter } from "../router";
import { ToastProvider } from "../components/Toast/components/ToastContext";
import { HermesWrapper } from "./HermesWrapper";
import { TestToast } from "./Toast/TestToast";
import { QuotaWatcher } from "./QuotaWatcher";
import { CustomCursor } from "./CustomCursor";

function ThemeWatcher() {
  const { colorMode } = useColorMode();

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(colorMode);
  }, [colorMode]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <ThemeWatcher />
            <AppRouter />
            <HermesWrapper />
          <TestToast />
          <QuotaWatcher />
          <CustomCursor />
        </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
