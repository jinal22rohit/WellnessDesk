import React from "react";

export function SlotSelector({ slots, value, onChange }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {slots.map((s) => {
        const disabled = !s.available;
        const selected = value === s.time;
        return (
          <button
            key={s.time}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(s.time)}
            className={
              "px-3 py-2 rounded-md text-sm border font-medium transition " +
              (disabled
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : selected
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-400")
            }
          >
            {s.time}
          </button>
        );
      })}
    </div>
  );
}

