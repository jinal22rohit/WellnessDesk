import { api } from "./api";

export async function submitContact({ name, email, subject, message }) {
  const res = await api.post("/contact/addcontact", { name, email, subject, message });
  return res.data;
}

export async function fetchContactMessages() {
  const res = await api.get("/contact/getallcontact");
  return res.data;
}

