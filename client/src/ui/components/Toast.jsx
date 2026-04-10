import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, duration = 3000) => {
    const id = Date.now();
    const toast = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const typeClasses = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800"
  };

  return (
    <div 
      className={`p-3 rounded-lg border text-sm ${typeClasses[toast.type]} animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span>{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-3 text-current/60 hover:text-current"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Add animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
