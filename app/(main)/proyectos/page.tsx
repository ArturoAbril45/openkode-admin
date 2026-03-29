"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, Globe, Smartphone, Monitor, CalendarCheck,
  MessageSquare, Send, ChevronDown, ChevronUp, User, Layers, Loader2, Trash2,
} from "lucide-react";
import { getProyectosConcluidos, updateProyectoConcluido, removeProyectoConcluido } from "../../lib/services";
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

export default function ProyectosPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const [proyectos,    setProyectos]    = useState<Record<string, unknown>[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [expandido,    setExpandido]    = useState<string | null>(null);
  const [mensajes,     setMensajes]     = useState<Record<string, string>>({});
  const [saving,       setSaving]       = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);

  useEffect(() => {
    getProyectosConcluidos().then(data => {
      setProyectos(data);
      const init: Record<string, string> = {};
      data.forEach((p: Record<string, unknown>) => { init[p.id as string] = (p.mensajeFinal as string) ?? ""; });
      setMensajes(init);
      setLoadingData(false);
    });
  }, []);

  async function eliminarProyecto(id: string) {
    setDeleting(id);
    try {
      await removeProyectoConcluido(id);
      setProyectos(prev => prev.filter(p => p.id !== id));
      showToast(t.proyectosGuardadoOk ?? "Proyecto eliminado", "success");
    } catch {
      showToast(t.proyectosGuardadoError, "error");
    } finally {
      setDeleting(null);
    }
  }

  function toggleExpand(id: string) {
    setExpandido(prev => prev === id ? null : id);
  }

  async function guardarMensaje(id: string) {
    setSaving(id);
    try {
      await updateProyectoConcluido(id, { mensajeFinal: mensajes[id] ?? "" });
      setProyectos(prev =>
        prev.map(p => p.id === id ? { ...p, mensajeFinal: mensajes[id] } : p)
      );
      setExpandido(null);
      showToast(t.proyectosGuardadoOk, "success");
    } catch {
      showToast(t.proyectosGuardadoError, "error");
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
          <h2 className="panel-title">{t.proyectosTitle}</h2>
          <p className="panel-subtitle">
            {proyectos.length} {proyectos.length !== 1 ? t.proyectosPlural : t.proyectosSingular}{" "}
            {proyectos.length !== 1 ? t.proyectosTermPlural : t.proyectosTermSingular}
          </p>
        </div>
      </div>

      {loadingData ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      ) : proyectos.length === 0 ? (
        <div className="table-empty">
          <CheckCircle2 size={32} color="#3ecf8e" strokeWidth={1.5} />
          <p>{t.proyectosNinguno}</p>
        </div>
      ) : null}
      {!loadingData && proyectos.length > 0 && (
        <div className="concluidos-list">
          {proyectos.map(p => {
            const id    = p.id as string;
            const tipo  = (p.tipo as string) ?? "web";
            return (
              <div key={id} className="concluido-card">

                <div className="concluido-header">
                  <div className="concluido-check">
                    <CheckCircle2 size={20} color="#3ecf8e" strokeWidth={2} />
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
                      <CalendarCheck size={12} strokeWidth={1.8} />
                      <span>{formatFecha(p.fechaInicio as string, locale)} → {formatFecha(p.fechaEntrega as string, locale)}</span>
                    </div>

                    <div className="concluido-techs">
                      {((p.tecnologias as string[]) ?? []).map(tv => (
                        <span key={tv} className="tech-chip tech-chip-sm">{tv}</span>
                      ))}
                    </div>

                    {(p.mensajeFinal as string) && expandido !== id && (
                      <div className="concluido-mensaje-preview">
                        <MessageSquare size={12} strokeWidth={1.8} />
                        <span>{p.mensajeFinal as string}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                    <button className="concluido-toggle" onClick={() => toggleExpand(id)}>
                      {expandido === id
                        ? <ChevronUp size={16} strokeWidth={2} />
                        : <ChevronDown size={16} strokeWidth={2} />}
                      <span>
                        {expandido === id
                          ? t.proyectosCerrar
                          : (p.mensajeFinal as string) ? t.proyectosEditarMensaje : t.proyectosMensajeFinalBtn}
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
                    <label className="form-label">{t.proyectosMensajeFinalLabel}</label>
                    <div className="form-textarea-wrap">
                      <MessageSquare size={14} className="form-textarea-icon" strokeWidth={1.8} />
                      <textarea
                        className="form-textarea"
                        rows={4}
                        placeholder={`e.g. Hi ${(p.cliente as string).split(" ")[0]}, it was a pleasure developing this project...`}
                        value={mensajes[id] ?? ""}
                        onChange={e => setMensajes({ ...mensajes, [id]: e.target.value })}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                      <button
                        type="button"
                        className="form-btn-submit"
                        style={{ padding: "0.55rem 1.25rem", fontSize: "0.82rem" }}
                        onClick={() => guardarMensaje(id)}
                        disabled={saving === id}
                      >
                        {saving === id
                          ? <><Loader2 size={14} className="btn-spin" /> {t.saving}</>
                          : <><Send size={14} strokeWidth={2} /> {t.proyectosGuardarMensaje}</>}
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
