"use client";

import { useState, useEffect } from "react";
import {
  XCircle, Globe, Smartphone, Monitor, CalendarX,
  ChevronDown, ChevronUp, User, Layers, AlertTriangle, Loader2, Trash2,
} from "lucide-react";
import { getProyectosCancelados, updateProyectoCancelado, removeProyectoCancelado } from "../../lib/services";
import { showToast } from "../../components/Toast";
import { useLang } from "../../lib/LangContext";

const TIPO_ICON: Record<string, React.ReactNode> = {
  web:     <Globe      size={14} strokeWidth={1.8} />,
  app:     <Smartphone size={14} strokeWidth={1.8} />,
  desktop: <Monitor    size={14} strokeWidth={1.8} />,
};

const TIPO_CLASS: Record<string, string> = {
  web: "badge-web", app: "badge-app", desktop: "badge-desktop",
};

function formatFecha(iso: string, locale: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default function ProyectosCanceladosPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const [proyectos,   setProyectos]   = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandido,   setExpandido]   = useState<string | null>(null);
  const [motivos,     setMotivos]     = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState<string | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);

  useEffect(() => {
    getProyectosCancelados().then(data => {
      setProyectos(data);
      const init: Record<string, string> = {};
      data.forEach((p: Record<string, unknown>) => { init[p.id as string] = (p.motivo as string) ?? ""; });
      setMotivos(init);
      setLoadingData(false);
    });
  }, []);

  async function eliminarProyecto(id: string) {
    setDeleting(id);
    try {
      await removeProyectoCancelado(id);
      setProyectos(prev => prev.filter(p => p.id !== id));
      showToast("Proyecto eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    } finally {
      setDeleting(null);
    }
  }

  function toggleExpand(id: string) {
    setExpandido(prev => prev === id ? null : id);
  }

  async function guardarMotivo(id: string) {
    setSaving(id);
    try {
      await updateProyectoCancelado(id, { motivo: motivos[id] ?? "" });
      setProyectos(prev =>
        prev.map(p => p.id === id ? { ...p, motivo: motivos[id] } : p)
      );
      setExpandido(null);
      showToast(t.canceladosGuardadoOk, "success");
    } catch {
      showToast(t.canceladosGuardadoError, "error");
    } finally {
      setSaving(null);
    }
  }

  const tipoBadgeLabel = (tipo: string) =>
    tipo === "web" ? t.badgeWeb : tipo === "app" ? t.badgeApp : t.badgeDesktop;

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.canceladosTitle}</h2>
          <p className="panel-subtitle">
            {proyectos.length} {proyectos.length !== 1 ? t.canceladosPlural : t.canceladosSingular}{" "}
            {proyectos.length !== 1 ? t.canceladosCancelPlural : t.canceladosCancelSingular}
          </p>
        </div>
      </div>

      {loadingData ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      ) : proyectos.length === 0 ? (
        <div className="table-empty">
          <XCircle size={32} color="#ef4444" strokeWidth={1.5} />
          <p>{t.canceladosNinguno}</p>
        </div>
      ) : (
        <div className="concluidos-list">
          {proyectos.map(p => {
            const id   = p.id as string;
            const tipo = (p.tipo as string) ?? "web";
            return (
              <div key={id} className="concluido-card cancelado-card">

                <div className="concluido-header">
                  <div className="concluido-check">
                    <XCircle size={20} color="#ef4444" strokeWidth={2} />
                  </div>

                  <div className="concluido-info">
                    <div className="concluido-nombre">{p.proyecto as string}</div>
                    <div className="concluido-meta">
                      <span className="concluido-cliente">
                        <User size={12} strokeWidth={1.8} /> {p.cliente as string}
                      </span>
                      <span className={`pedido-tipo-badge ${TIPO_CLASS[tipo] ?? ""}`} style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem" }}>
                        {TIPO_ICON[tipo]} {tipoBadgeLabel(tipo)}
                      </span>
                      <span className="concluido-servicio">
                        <Layers size={12} strokeWidth={1.8} /> {p.servicio as string}
                      </span>
                    </div>

                    <div className="concluido-fechas">
                      <CalendarX size={12} strokeWidth={1.8} />
                      <span>
                        {t.canceladosInicioLabel}: {formatFecha(p.fechaInicio as string, locale)} · {t.canceladosCanceladoLabel}: {formatFecha(p.fechaCancelacion as string, locale)}
                      </span>
                    </div>

                    <div className="concluido-techs">
                      {((p.tecnologias as string[]) ?? []).map(tv => (
                        <span key={tv} className="tech-chip tech-chip-sm">{tv}</span>
                      ))}
                    </div>

                    {(p.motivo as string) && expandido !== id && (
                      <div className="concluido-mensaje-preview cancelado-motivo-preview">
                        <AlertTriangle size={12} strokeWidth={1.8} />
                        <span>{p.motivo as string}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                    <button className="concluido-toggle cancelado-toggle" onClick={() => toggleExpand(id)}>
                      {expandido === id
                        ? <ChevronUp size={16} strokeWidth={2} />
                        : <ChevronDown size={16} strokeWidth={2} />}
                      <span>
                        {expandido === id
                          ? t.canceladosCerrar
                          : (p.motivo as string) ? t.canceladosEditarMotivo : t.canceladosMotivoBtn}
                      </span>
                    </button>
                    <button
                      className="cv-delete-btn"
                      onClick={() => eliminarProyecto(id)}
                      disabled={deleting === id}
                      title="Eliminar proyecto"
                    >
                      {deleting === id
                        ? <Loader2 size={14} className="btn-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {expandido === id && (
                  <div className="concluido-mensaje-panel">
                    <label className="form-label">{t.canceladosMotivoLabel}</label>
                    <div className="form-textarea-wrap">
                      <AlertTriangle size={14} className="form-textarea-icon" strokeWidth={1.8} />
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder={t.canceladosMotivoPH}
                        value={motivos[id] ?? ""}
                        onChange={e => setMotivos({ ...motivos, [id]: e.target.value })}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                      <button
                        type="button"
                        className="cancelado-btn-guardar"
                        onClick={() => guardarMotivo(id)}
                        disabled={saving === id}
                      >
                        {saving === id
                          ? <><Loader2 size={14} className="btn-spin" /> {t.saving}</>
                          : t.canceladosGuardarMotivo}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
