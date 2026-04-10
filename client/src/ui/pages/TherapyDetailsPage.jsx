import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container } from "../shared/Container";
import { fetchTherapy } from "../services/therapy";
import { api } from "../services/api";

function toImageSrc(value) {
  if (!value) return "";
  if (typeof value !== "string") return "";
  const baseUrl = api.defaults.baseURL || "http://localhost:7002";

  const uploadsIdx = value.indexOf("/uploads/");
  if (uploadsIdx !== -1) {
    const filename = value.slice(uploadsIdx + "/uploads/".length);
    return `${baseUrl}/uploads/${filename}`;
  }
  const therapyImgIdx = value.indexOf("/therapyImage/");
  if (therapyImgIdx !== -1) {
    const filename = value.slice(therapyImgIdx + "/therapyImage/".length);
    return `${baseUrl}/uploads/${filename}`;
  }

  if (value.startsWith("/")) return `${baseUrl}${value}`;
  if (value.startsWith("uploads/")) return `${baseUrl}/${value}`;
  return `${baseUrl}/${value}`;
}

export function TherapyDetailsPage() {
  const { id } = useParams();
  const [therapy, setTherapy] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    fetchTherapy(id).then(setTherapy).catch(() => {});
  }, [id]);

  if (!therapy) {
    return (
      <Container className="py-10">
        <div className="rounded-xl border bg-white p-6">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="aspect-[4/3] bg-slate-100">
            {toImageSrc(therapy?.therapyImage) ? (
              <img src={toImageSrc(therapy?.therapyImage)} alt={therapy.therapyName} className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>
        <div>
          <Link to="/therapies" className="text-sm text-slate-600 hover:underline">
            ← Back to therapies
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{therapy.therapyName}</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800">{therapy.duration} minutes</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
              ₹{therapy.therapyprice}
            </span>
            {therapy.category ? (
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">{therapy.category}</span>
            ) : null}
          </div>
          <p className="mt-5 text-slate-600">
            A premium experience designed to help you relax and rejuvenate. (You can extend this with richer
            descriptions in the model later.)
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => nav(`/booking?therapyId=${encodeURIComponent(therapy._id)}`)}
              className="px-5 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
              Book this therapy
            </button>
            <button
              onClick={() => nav("/booking")}
              className="px-5 py-3 rounded-lg border bg-white text-slate-900 font-medium hover:bg-slate-50"
            >
              See all booking options
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}

