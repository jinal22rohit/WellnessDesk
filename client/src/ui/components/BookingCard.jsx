import React from "react";

function badgeClass(status) {
  if (status === "completed") return "bg-emerald-100 text-emerald-800";
  if (status === "cancelled") return "bg-rose-100 text-rose-800";
 return "bg-blue-100 text-blue-800";
}

  export function BookingCard({ booking, onCancel, onComplete, onBookAgain, canCancel, canComplete, actionLoading }) {
  const therapyName = booking?.therapyId?.therapyName || booking?.empID?.therapyId?.therapyName || "Therapy";
  const empName = booking?.empID?.empName || "Employee";
  const userName = booking?.userID?.username || "Client";

  return (
    <div className="rounded-xl border bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
              <div className="font-semibold text-slate-900">🌿 {therapyName}</div>
<div className="text-sm text-slate-600">
  📅 {booking?.date ? new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"} &nbsp;🕐 {booking?.time || "-"}
</div>
<div className="border-t border-slate-300 mt-1 pt-1 flex gap-4">
  <div className="flex flex-col">
    <span className="font-medium text-slate-800 text-sm">{empName}</span>
    <span className="text-xs text-slate-400">Employee</span>
  </div>
  <div className="flex flex-col">
    <span className="font-medium text-slate-800 text-sm">{userName}</span>
    <span className="text-xs text-slate-400">Client</span>
  </div>
</div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass(booking?.status)}`}>
          {booking?.status || "booked"}
        </span>
      </div>

    <div className="flex items-center gap-2">
        {canCancel ? (
          <button
            onClick={() => onCancel?.(booking)}
            disabled={booking?.status !== "booked" || actionLoading}
            className="px-3 py-2 rounded-md text-sm font-medium bg-rose-100 text-rose-600 hover:bg-rose-200 disabled:opacity-50"
          >
            {actionLoading ? "Cancelling..." : "Cancel"}
          </button>
        ) : null}
        {canComplete ? (
          <button
            onClick={() => onComplete?.(booking)}
            disabled={booking?.status !== "booked" || actionLoading}
            className="px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white disabled:opacity-50"
          >
            {actionLoading ? "Saving..." : "Mark Completed"}
          </button>
        ) : null}
        {onBookAgain ? (
          <button
            onClick={() => onBookAgain(booking)}
            className="px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800"
          >
            Book Again
          </button>
        ) : null}
      </div>
    </div>
  );
}

