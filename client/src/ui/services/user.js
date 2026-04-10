import { api } from "./api";

export async function getMyUserProfile() {
  const res = await api.get("/api/users/me");
  return res.data;
}

export async function getUserById(userId) {
  const res = await api.get(`/api/users/${userId}`);
  return res.data;
}

export async function getUserByEmployeeId(employeeId) {
  const res = await api.get(`/api/users/by-employee/${employeeId}`);
  return res.data;
}

export async function updateMyUserProfile({ name, email, phoneNumber, dob, profileImageFile }) {
  const fd = new FormData();
  if (name != null) fd.append("name", name);
  if (email != null) fd.append("email", email);
  if (phoneNumber != null) fd.append("phoneNumber", phoneNumber);
  if (dob) fd.append("dob", dob);
  if (profileImageFile) fd.append("profileImage", profileImageFile);

  const res = await api.patch("/api/users/me", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

