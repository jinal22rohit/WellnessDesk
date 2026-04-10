// ✅ CORRECT — full corrected booking.js
import { api } from "./api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createBooking({ userID, empID, therapyId, date, time }) {
  const res = await api.post("/api/booking", { userID, empID, therapyId, date, time }, { headers: authHeader() });
  return res.data;
}

export async function getUserBookings(userID) {
  const res = await api.get(`/api/booking/user/${userID}`, { headers: authHeader() });
  return res.data;
}

export async function getUserCompleted(userID) {
  const res = await api.get(`/api/booking/user/${userID}/completed`, { headers: authHeader() });
  return res.data;
}

export async function getEmployeeBookings(empID, range = "all") {
  const res = await api.get(`/api/booking/employee/${empID}?range=${encodeURIComponent(range)}`, { headers: authHeader() });
  return res.data;
}

export async function getMyEmployeeBookings() {
  const res = await api.get("/api/booking/employee/me/appointments", { headers: authHeader() });
  return res.data;
}

export async function getAllBookings({ skip = 0, limit = 30 } = {}) {
  const res = await api.get("/api/booking/all", { params: { skip, limit }, headers: authHeader() });
  return res.data;
}

export async function cancelBooking(id) {
  const res = await api.put(`/api/booking/cancel/${id}`, {}, { headers: authHeader() });
  return res.data;
}

export async function completeBooking(id) {
  const res = await api.put(`/api/booking/complete/${id}`, {}, { headers: authHeader() });
  return res.data;
}

export async function getSlots({ therapyId, empID, date }) {
  const res = await api.post("/api/booking/slots", { therapyId, empID, date }, { headers: authHeader() });
  return res.data;
}