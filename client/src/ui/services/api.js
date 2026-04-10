import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7002";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token ? "EXISTS" : "MISSING");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}