import { api } from "./api";


// =============================
// GET ALL EMPLOYEES
// =============================
export async function fetchEmployees() {
  const res = await api.get("/api/employee/getEmployees");
  return res.data;
}


// =============================
// GET EMPLOYEE BY ID (IMPORTANT)
// =============================
export async function getEmployeeById(id) {
  const res = await api.get(`/api/employee/getEmployee/${encodeURIComponent(id)}`);
  return res.data;
}


// =============================
// CREATE EMPLOYEE (USER + EMPLOYEE)
// =============================
export async function createEmployee({
  username,
  email,
  password,
  phno,
  empName,
  dob,
  therapyId,
  empImgFile
}) {
  const fd = new FormData();

  fd.append("username", username);
  fd.append("email", email);
  fd.append("password", password);
  fd.append("phno", phno);
  fd.append("empName", empName);

  if (dob) fd.append("dob", dob);
  if (therapyId) fd.append("therapyId", therapyId);
  if (empImgFile) fd.append("empImg", empImgFile);

  const res = await api.post("/api/employee/postEmployee", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}


// =============================
// UPDATE EMPLOYEE (EMPLOYEE + USER)
// =============================
// ✅ Correct — use FormData to support image
export async function updateEmployee(id, {
  empName, dob, therapyId, email, phoneNumber, password, empImgFile
}) {
  const fd = new FormData();
  if (empName) fd.append("empName", empName);
  if (dob) fd.append("dob", dob);
  if (therapyId) fd.append("therapyId", therapyId);
  if (email) fd.append("email", email);
  if (phoneNumber) fd.append("phoneNumber", phoneNumber);
  if (password) fd.append("password", password);
  if (empImgFile) fd.append("empImg", empImgFile);

  const res = await api.patch(
    `/api/employee/updateEmployee/${encodeURIComponent(id)}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

// =============================
// DELETE EMPLOYEE
// =============================
export async function deleteEmployee(id) {
  const res = await api.delete(
    `/api/employee/deleteEmployee/${encodeURIComponent(id)}`
  );
  return res.data;
}


// =============================
// FIND EMPLOYEES BY THERAPY
// =============================
export async function findEmployeesByTherapy(therapyId) {
  const res = await api.post("/api/employee/findEmployeeByTherapy", {
    therapyId
  });
  return res.data;
}


// =============================
// EMPLOYEE SELF PROFILE
// =============================
export async function getMyEmployeeProfile() {
  const res = await api.get("/api/employee/me");
  return res.data;
}


// =============================
// UPDATE SELF PROFILE
// =============================
export async function updateMyEmployeeProfile({
  empName,
  dob,
  email,
  phno,
  empImgFile,
  password
}) {
  const fd = new FormData();

  if (empName) fd.append("empName", empName);
  if (dob) fd.append("dob", dob);
  if (email) fd.append("email", email);
  if (phno) fd.append("phno", phno);
  if (empImgFile) fd.append("empImg", empImgFile);
  if (password && password.trim()) fd.append("password", password.trim());

  const res = await api.patch("/api/employee/me", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}