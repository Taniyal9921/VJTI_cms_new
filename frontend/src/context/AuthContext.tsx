import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAuthToken, api } from "../api/client";
import * as cms from "../api/cms";
import type { User } from "../types/models";

type AuthState = {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cms_token"));

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem("cms_token");
    if (!t) {
      setUser(null);
      return;
    }
    setAuthToken(t);
    const me = await cms.fetchMe();
    setUser(me);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          setAuthToken(token);
          const me = await cms.fetchMe();
          setUser(me);
        }
      } catch {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const t = await cms.login(email, password);
    setAuthToken(t);
    setToken(t);
    const me = await cms.fetchMe();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  }, []);

  const value = useMemo(
    () => ({ user, loading, token, login, logout, refreshUser }),
    [user, loading, token, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
