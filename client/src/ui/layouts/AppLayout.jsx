import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../shared/Navbar";
import { Footer } from "../shared/Footer";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../services/api";

export function AppLayout() {
  const { token } = useAuth();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

