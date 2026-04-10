import { api } from "./api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getRevenueAnalytics() {
  const res = await api.get("/api/analytics/revenue", { headers: authHeader() });
  return res.data;
}