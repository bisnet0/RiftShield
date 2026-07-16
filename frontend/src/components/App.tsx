import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppRouter } from "../router";
import { ToastProvider } from "../components/Toast/components/ToastContext";
import { HermesWrapper } from "./HermesWrapper";
import { TestToast } from "./Toast/TestToast";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <HermesWrapper />
          <TestToast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
