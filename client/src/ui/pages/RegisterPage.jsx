import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../shared/Container";
import { registerApi } from "../services/auth";

export function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user",
  });
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErrMsg("");
    try {
      await registerApi(form);
      setMsg("Registered successfully. Please login.");
      setTimeout(() => nav("/login"), 600);
    } catch (err) {
      setErrMsg(err?.response?.data?.message || err?.message || "Registration failed");
    }
  }

  return (
    <Container className="py-10">
      <div className="max-w-md mx-auto rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Register</h1>
        <p className="mt-1 text-slate-600 text-sm">Create an account to book appointments.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <input
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
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
          <div className="text-xs text-slate-500">Self registration creates a customer account.</div>

          {msg ? <div className="text-sm rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2">{msg}</div> : null}
          {errMsg ? <div className="text-sm rounded-lg bg-rose-50 text-rose-800 px-3 py-2">{errMsg}</div> : null}

          <button className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800">
            Register
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </Container>
  );
}

