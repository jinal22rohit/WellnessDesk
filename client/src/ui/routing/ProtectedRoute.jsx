import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../services/api";

export function ProtectedRoute({ roles, children }) {
  const { isAuthed, user, token } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!isAuthed) {
      nav("/login", { replace: true, state: { from: loc.pathname } });
      return;
    }

    if (roles?.length && !roles.includes(user?.role)) {
      nav("/", { replace: true });
    }
  }, [isAuthed, user, roles, nav, loc.pathname]);

  if (!isAuthed) return null;
  if (roles?.length && !roles.includes(user?.role)) return null;

  return children;
}