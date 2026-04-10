import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

function safeDecode(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

// ✅ CORRECT — call setAuthToken immediately in useState initializer
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token") || "";
    if (t) setAuthToken(t);  // ← set immediately, before any render
    return t;
  });
  const [user, setUser] = useState(() => (token ? safeDecode(token) : null));

  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem("token");
      setAuthToken(null);
      return;
    }
    localStorage.setItem("token", token);
    setAuthToken(token);
    setUser(safeDecode(token));
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user, // { id, role, iat, exp } from backend JWT
      isAuthed: Boolean(token && user),
      login: (newToken) => setToken(newToken),
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("empEmail");
        localStorage.removeItem("empID");
        setToken("");
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

