"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  open:      boolean;
  title:     string;
  message:   string;
  onConfirm: () => void;
  onCancel:  () => void;
  confirmLabel?: string;
  danger?:   boolean;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirmar", danger = false }: Props) {
  if (!open) return null;
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon-wrap ${danger ? "confirm-icon-danger" : "confirm-icon-primary"}`}>
          <AlertTriangle size={22} strokeWidth={2} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className={`confirm-btn-ok ${danger ? "confirm-btn-danger" : ""}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
