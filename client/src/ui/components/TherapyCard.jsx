import React from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function toImageSrc(value) {
  if (!value) return "";
  if (typeof value !== "string") return "";

  // If it's already an absolute URL (Cloudinary or any https), use it directly
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Fallback for old relative paths
  const baseUrl = api.defaults.baseURL || "http://localhost:7002";
  if (value.startsWith("/")) return `${baseUrl}${value}`;
  return `${baseUrl}/${value}`;
}

  

  // If backend stored an absolute URL with the wrong host/port, rebuild it from the uploads part.
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

export function TherapyCard({ therapy }) {
  const therapyImageSrc = toImageSrc(therapy?.therapyImage);
  return (
    <Link
      to={`/therapies/${therapy._id}`}
      className="group rounded-xl border bg-white overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {therapyImageSrc ? (
          <img
            src={therapyImageSrc}
            alt={therapy.therapyName}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="font-semibold text-slate-900">{therapy.therapyName}</div>
        <div className="mt-1 text-sm text-slate-600 flex items-center justify-between gap-3">
          <span>{therapy.duration} min</span>
          <span className="font-medium text-emerald-700">₹{therapy.therapyprice}</span>
        </div>
        {therapy.category ? (
          <div className="mt-2 text-xs text-slate-500">Category: {therapy.category}</div>
        ) : null}
      </div>
    </Link>
  );
}

