import { api } from "./api";

export async function fetchTherapies() {
  const res = await api.get("/api/therapy");
  return res.data;
}

export async function fetchTherapy(id) {
  const res = await api.get("/api/therapy");
  const list = res.data || [];
  return list.find((t) => t._id === id) || null;
}

export async function createTherapy({ therapyName, therapyprice, duration, category, therapyImageFile }) {
  const fd = new FormData();
  if (therapyName != null) fd.append("therapyName", therapyName);
  if (therapyprice != null) fd.append("therapyprice", String(therapyprice));
  if (duration != null) fd.append("duration", String(duration));
  if (category != null) fd.append("category", category);
  if (therapyImageFile) fd.append("therapyImage", therapyImageFile);

  const res = await api.post("/api/therapy", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateTherapy(id, { therapyName, therapyprice, duration, category, therapyImageFile }) {
  const fd = new FormData();
  if (therapyName != null) fd.append("therapyName", therapyName);
  if (therapyprice != null) fd.append("therapyprice", String(therapyprice));
  if (duration != null) fd.append("duration", String(duration));
  if (category != null) fd.append("category", category);
  if (therapyImageFile) fd.append("therapyImage", therapyImageFile);

  const res = await api.put(`/api/therapy/${encodeURIComponent(id)}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteTherapy(id) {
  const res = await api.delete(`/api/therapy/${encodeURIComponent(id)}`);
  return res.data;
}

