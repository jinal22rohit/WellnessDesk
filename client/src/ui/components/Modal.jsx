import React, { useEffect } from "react";

export function Modal({ open, title, children, onClose, footer, size = "medium" }) {
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl", 
    large: "max-w-4xl",
    fullscreen: "max-w-full mx-4"
  };

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-8 overflow-auto">
        <div className={`w-full ${sizeClasses[size]} rounded-2xl border bg-white shadow-xl`}>
          <div className="p-5 border-b flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">{title}</div>
            </div>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="p-5">{children}</div>
          {footer ? <div className="p-5 border-t bg-slate-50 rounded-b-2xl">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

