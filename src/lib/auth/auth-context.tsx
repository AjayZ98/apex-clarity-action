import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { DemoUser } from "./types";
import { clearStoredUser, getStoredUser, setStoredUser } from "./session";

interface AuthContextValue {
  user: DemoUser | null;
  login: (user: DemoUser) => void;
  logout: () => void;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  const login = (next: DemoUser) => {
    setStoredUser(next);
    setUser(next);
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
