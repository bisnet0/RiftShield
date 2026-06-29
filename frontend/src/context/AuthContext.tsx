import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../middleware/api";
import { ROUTES } from "../router/paths";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextData {
  user: User | null;
  signIn: (userData: User) => void;
  signOut: () => void;
  isAuthenticated: boolean;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data.user);
      } catch (error) {
        try {
          await api.post("/auth/refresh");
          const response = await api.get("/users/me");
          setUser(response.data.user);
        } catch {
          setUser(null);
        }
      } finally {
        setLoadingAuth(false);
      }
    };
    checkSession();
  }, []);

  const signIn = (userData: User) => {
    setUser(userData);
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Erro no logout");
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, isAuthenticated: !!user, loadingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
