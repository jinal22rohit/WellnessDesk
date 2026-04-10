import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../shared/Container";
import { loginApi } from "../services/auth";
import { useAuth } from "../context/AuthContext";



export function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [errMsg, setErrMsg] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setErrMsg("");
    try {
      const res = await loginApi(form);
      if (res?.token) {
      login(res.token);
      const decoded = jwtDecode(res.token);
      const role = decoded?.role;
      const destination =
       role === "admin" ? "/dashboard/admin" :
      role === "employee" ? "/dashboard/employee" :
     "/dashboard/customer";
nav(destination, { replace: true });
      } else {
        setErrMsg(res?.message || "Login failed");
      }
    } catch (err) {
      setErrMsg(err?.response?.data?.message || err?.message || "Login failed");
    }
  }

  return (
    <Container className="py-10">
      <div className="max-w-md mx-auto rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-slate-600 text-sm">Access your bookings and dashboard.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Login as</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="user">Customer</option>
              <option value="emp">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              {form.role === "emp" ? "Email or username" : "Username"}
            </label>
            <input
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder={form.role === "emp" ? "e.g. therapist@spa.com or johndoe" : "Enter your username"}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              required
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>

          {errMsg ? <div className="text-sm rounded-lg bg-rose-50 text-rose-800 px-3 py-2">{errMsg}</div> : null}

          <button className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800">
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link to="/register" className="font-medium text-slate-900 hover:underline">
            Register
          </Link>
        </div>

        <div className="mt-3 text-sm">
          <Link to="/forgot-password" className="text-slate-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>
      </div>
    </Container>
  );
}

