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
// ✅ CORRECT — add errors state and full validation
const [msg, setMsg] = useState("");
const [errMsg, setErrMsg] = useState("");
const [errors, setErrors] = useState({}); 
const nav = useNavigate();

async function onSubmit(e) {
  e.preventDefault();
  setMsg("");
  setErrMsg("");
  setErrors({});

  // all validations
  const newErrors = {};

  // username validation
  if (form.username.trim().length < 3) {
    newErrors.username = "Username must be at least 3 characters";
  }
  if (form.username.includes(" ")) {
    newErrors.username = "Username cannot contain spaces";
  }

  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim())) {
    newErrors.email = "Enter a valid email address";
  }

  // phone validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(form.phoneNumber)) {
    newErrors.phoneNumber = "Phone number must be exactly 10 digits";
  }

  // password validation
  if (form.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  }

  // if any error exists stop here
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    await registerApi({
      ...form,
      email: form.email.trim().toLowerCase(), // remove spaces from email
      username: form.username.trim(),
    });
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
             {errors.username && <p className="mt-1 text-xs text-rose-500">{errors.username}</p>}
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
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input
  required
  type="tel"
  maxLength={10}
  pattern="[0-9]{10}"
  className="mt-1 w-full rounded-lg border px-3 py-2"
  value={form.phoneNumber}
  onChange={(e) =>
    setForm((f) => ({
      ...f,
      phoneNumber: e.target.value.replace(/\D/g, "")
    }))
  }
/>
    {errors.phoneNumber && <p className="mt-1 text-xs text-rose-500">{errors.phoneNumber}</p>}
      <p className="mt-1 text-xs text-slate-400">Enter 10 digit mobile number</p>
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
                 {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                 <p className="mt-1 text-xs text-slate-400">Minimum 8 characters</p>
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

