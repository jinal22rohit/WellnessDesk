import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function navClass({ isActive }) {
  return (
    "px-3 py-2 rounded-md text-sm font-medium " +
    (isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200")
  );
}

export function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const nav = useNavigate();

  const dashboardHref =
    user?.role === "admin"
      ? "/dashboard/admin"
      : user?.role === "employee"
        ? "/dashboard/employee"
        : "/dashboard/customer";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="font-semibold tracking-tight text-slate-900">
          Ultron Spa
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/therapies" className={navClass}>
            Therapies
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Link
                to="/booking"
                className="hidden sm:inline-flex px-3 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                Book Now
              </Link>
              <Link
                to={dashboardHref}
                className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

