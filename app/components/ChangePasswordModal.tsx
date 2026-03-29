"use client";

import { useState, useEffect } from "react";
import { KeyRound, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { showToast } from "./Toast";
import PasswordStrength from "./PasswordStrength";
import { useLang } from "../lib/LangContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const { t } = useLang();
  const [actual,       setActual]       = useState("");
  const [nueva,        setNueva]        = useState("");
  const [confirmar,    setConfirmar]    = useState("");
  const [showActual,   setShowActual]   = useState(false);
  const [showNueva,    setShowNueva]    = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function reset() {
    setActual(""); setNueva(""); setConfirmar("");
    setError(""); setLoading(false);
    setShowActual(false); setShowNueva(false); setShowConfirm(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!actual)           return setError(t.pwErrorActualReq);
    if (nueva.length < 6)  return setError(t.pwErrorMinChars);
    if (nueva !== confirmar) return setError(t.pwErrorNoCoinciden);

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("Sin usuario");
      const cred = EmailAuthProvider.credential(user.email, actual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, nueva);
      showToast(t.pwActualizadaOk, "success");
      handleClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError(t.pwErrorActualWrong);
      } else {
        setError(t.pwErrorGeneral);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="change-pw-modal">

        <div className="change-pw-header">
          <div className="change-pw-icon">
            <KeyRound size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="change-pw-title">{t.pwTitle}</p>
            <p className="change-pw-subtitle">{t.pwSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {error && (
            <div className="change-pw-error">{error}</div>
          )}

          <div className="change-pw-fields">

            <div className="form-field">
              <label className="form-label">{t.pwActual}</label>
              <div className="form-icon-wrap">
                <Lock size={14} className="form-icon" strokeWidth={1.8} />
                <input
                  type={showActual ? "text" : "password"}
                  className="form-input has-icon has-icon-right"
                  placeholder={t.pwActualPH}
                  value={actual}
                  onChange={e => { setActual(e.target.value); setError(""); }}
                  disabled={loading}
                />
                <button type="button" className="form-toggle-pw" onClick={() => setShowActual(v => !v)}>
                  {showActual ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">{t.pwNueva}</label>
              <div className="form-icon-wrap">
                <KeyRound size={14} className="form-icon" strokeWidth={1.8} />
                <input
                  type={showNueva ? "text" : "password"}
                  className="form-input has-icon has-icon-right"
                  placeholder={t.pwNuevaPH}
                  value={nueva}
                  onChange={e => { setNueva(e.target.value); setError(""); }}
                  disabled={loading}
                />
                <button type="button" className="form-toggle-pw" onClick={() => setShowNueva(v => !v)}>
                  {showNueva ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
              <PasswordStrength password={nueva} />
            </div>

            <div className="form-field">
              <label className="form-label">{t.pwConfirmar}</label>
              <div className="form-icon-wrap">
                <KeyRound size={14} className="form-icon" strokeWidth={1.8} />
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`form-input has-icon has-icon-right${confirmar && confirmar !== nueva ? " form-input-error" : ""}`}
                  placeholder={t.pwConfirmarPH}
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); setError(""); }}
                  disabled={loading}
                />
                <button type="button" className="form-toggle-pw" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
              {confirmar && confirmar !== nueva && (
                <p className="form-error-msg">{t.pwNoCoinciden}</p>
              )}
            </div>

          </div>

          <div className="change-pw-actions">
            <button type="button" className="form-btn-cancel" onClick={handleClose} disabled={loading}>
              {t.pwCancelar}
            </button>
            <button type="submit" className="form-btn-submit" disabled={loading}>
              {loading
                ? <><Loader2 size={14} className="btn-spin" /> {t.pwGuardando}</>
                : <><KeyRound size={14} strokeWidth={2} /> {t.pwCambiar}</>}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
