import React from "react";

export function Spinner({ size = "medium", className = "" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6", 
    large: "w-8 h-8"
  };

  return (
    <div 
      className={`border-2 border-slate-900 border-t-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}
    />
  );
}

export function LoadingSpinner({ text = "Loading...", size = "medium" }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <Spinner size={size} />
        <span className="text-slate-600">{text}</span>
      </div>
    </div>
  );
}
