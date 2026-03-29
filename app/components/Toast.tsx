"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ICONS = {
  success: <CheckCircle2 size={16} strokeWidth={2} />,
  error:   <XCircle      size={16} strokeWidth={2} />,
  warning: <AlertTriangle size={16} strokeWidth={2} />,
  info:    <Info          size={16} strokeWidth={2} />,
};

const COLORS = {
  success: "toast-success",
  error:   "toast-error",
  warning: "toast-warning",
  info:    "toast-info",
};

export function showToast(message: string, type: ToastType = "success") {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const { message, type } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${COLORS[t.type]}`}>
          {ICONS[t.type]}
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
