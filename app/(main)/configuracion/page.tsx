"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Building2, Globe, Save, ImageIcon, Loader2, FileText, Upload, Download, Trash2 } from "lucide-react";
import { getConfiguracion, saveConfiguracion, uploadCV, deleteCV } from "../../lib/services";
import { showToast } from "../../components/Toast";
import { useLang } from "../../lib/LangContext";

const DEFAULT_PERFIL = {
  nombre:    "Administrador",
  correo:    "admin@openkode.com",
  telefono:  "",
  empresa:   "OpenKode Dev",
  sitio:     "",
  foto:      "",
  cvUrl:     "",
  cvNombre:  "",
};

export default function ConfiguracionPage() {
  const { t } = useLang();
  const [perfil,      setPerfil]      = useState(DEFAULT_PERFIL);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);
  const cvRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getConfiguracion().then(data => {
      if (data) setPerfil({ ...DEFAULT_PERFIL, ...data });
      setLoading(false);
    });
  }, []);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPerfil(p => ({ ...p, [name]: value }));
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast(t.configImagenError, "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setPerfil(p => ({ ...p, foto: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveConfiguracion(perfil);
      window.dispatchEvent(new Event("configuracion-updated"));
      showToast(t.configGuardadoOk, "success");
    } catch {
      showToast(t.configGuardadoError, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubirCV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast(t.configArchivoError, "error");
      return;
    }
    setUploadingCV(true);
    try {
      const { url, nombre } = await uploadCV(file);
      const nuevo = { ...perfil, cvUrl: url, cvNombre: nombre };
      setPerfil(nuevo);
      await saveConfiguracion(nuevo);
      showToast(t.configCVSubidoOk, "success");
    } catch {
      showToast(t.configCVSubidoError, "error");
    } finally {
      setUploadingCV(false);
      if (cvRef.current) cvRef.current.value = "";
    }
  }

  async function handleEliminarCV() {
    if (!perfil.cvNombre) return;
    try {
      await deleteCV(perfil.cvNombre);
      const nuevo = { ...perfil, cvUrl: "", cvNombre: "" };
      setPerfil(nuevo);
      await saveConfiguracion(nuevo);
      showToast(t.configCVEliminadoOk, "success");
    } catch {
      showToast(t.configCVEliminadoError, "error");
    }
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.configTitle}</h2>
          <p className="panel-subtitle">{t.configSubtitle}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      ) : (
      <div className="form-card">
        <form onSubmit={handleGuardar} noValidate>

          {/* ── Avatar ── */}
          <div className="config-avatar-wrap">
            <div className="config-avatar" style={perfil.foto ? { background: "none", padding: 0, overflow: "hidden" } : {}}>
              {perfil.foto
                ? <img src={perfil.foto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span>{perfil.nombre.charAt(0).toUpperCase()}</span>}
            </div>
            <div>
              <p className="config-avatar-name">{perfil.nombre}</p>
              <p className="config-avatar-email">{perfil.correo}</p>
              <button type="button" className="config-avatar-btn" onClick={() => fotoRef.current?.click()}>
                <ImageIcon size={13} strokeWidth={2} /> {t.configCambiarFoto}
              </button>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
            </div>
          </div>

          {/* ── Perfil ── */}
          <p className="form-section-label" style={{ marginTop: "1.5rem" }}>{t.configPerfil}</p>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">{t.configNombre}</label>
              <div className="form-icon-wrap">
                <User size={14} className="form-icon" strokeWidth={1.8} />
                <input name="nombre" value={perfil.nombre} onChange={handle}
                  className="form-input has-icon" placeholder={t.configNombrePH} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">{t.configCorreo}</label>
              <div className="form-icon-wrap">
                <Mail size={14} className="form-icon" strokeWidth={1.8} />
                <input name="correo" value={perfil.correo} onChange={handle}
                  className="form-input has-icon" placeholder="correo@ejemplo.com" />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">{t.configTelefono}</label>
              <div className="form-icon-wrap">
                <Phone size={14} className="form-icon" strokeWidth={1.8} />
                <input name="telefono" value={perfil.telefono} onChange={handle}
                  className="form-input has-icon" placeholder="+51 999 000 111" />
              </div>
            </div>

          </div>

          {/* ── Empresa ── */}
          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.configEmpresa}</p>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">{t.configNombreEmpresa}</label>
              <div className="form-icon-wrap">
                <Building2 size={14} className="form-icon" strokeWidth={1.8} />
                <input name="empresa" value={perfil.empresa} onChange={handle}
                  className="form-input has-icon" placeholder={t.configNombreEmpresaPH} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">{t.configSitio}</label>
              <div className="form-icon-wrap">
                <Globe size={14} className="form-icon" strokeWidth={1.8} />
                <input name="sitio" value={perfil.sitio} onChange={handle}
                  className="form-input has-icon" placeholder={t.configSitioPH} />
              </div>
            </div>

          </div>

          {/* ── CV ── */}
          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.configCV}</p>
          {perfil.cvUrl ? (
            <div className="cv-file-row">
              <FileText size={16} color="#6c63ff" />
              <span className="cv-file-name">{perfil.cvNombre}</span>
              <a href={perfil.cvUrl} target="_blank" rel="noreferrer" download={perfil.cvNombre} className="cv-download-btn">
                <Download size={14} /> {t.configDescargar}
              </a>
              <button type="button" className="cv-delete-btn" onClick={handleEliminarCV}>
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button type="button" className="cv-upload-btn" onClick={() => cvRef.current?.click()} disabled={uploadingCV}>
              {uploadingCV
                ? <><Loader2 size={14} className="btn-spin" /> {t.configSubiendo}</>
                : <><Upload size={14} /> {t.configSubirCV}</>}
            </button>
          )}
          <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleSubirCV} />

          {/* ── Submit ── */}
          <div className="form-actions">
            <button type="submit" className="form-btn-submit" disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="btn-spin" /> {t.configGuardando}</>
                : <><Save size={15} strokeWidth={2} /> {t.configGuardar}</>}
            </button>
          </div>

        </form>
      </div>
      )}
    </>
  );
}
