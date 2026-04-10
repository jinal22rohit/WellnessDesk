import { api } from "./api";

export async function loginApi({ username, password, role }) {
  const res = await api.post("/api/auth/login", { username, password, role });
  return res.data; // { token }
}

export async function registerApi({ username, password, role, email, phoneNumber }) {
  const res = await api.post("/api/auth/register", { username, password, role, email, phoneNumber });
  return res.data;
}

export async function sendOtp({ email, phoneNumber }) {
  const res = await api.post("/api/auth/send-otp", { email, phoneNumber });
  return res.data;
}

export async function verifyOtp({ email, phoneNumber, otp }) {
  const res = await api.post("/api/auth/verify-otp", { email, phoneNumber, otp });
  return res.data;
}

export async function resetPassword({ email, phoneNumber, otp, newPassword }) {
  const res = await api.post("/api/auth/reset-password", { email, phoneNumber, otp, newPassword });
  return res.data;
}

