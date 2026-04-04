"use client";

import { useState, useEffect } from "react";
import {
  Loader2, Pencil, X, Save, Plus, Trash2, Check,
  Link2, KeyRound, FileText, Copy, ExternalLink,
} from "lucide-react";
import { showToast } from "../../components/Toast";
import { getPedidos, getSeguimiento, saveSeguimiento } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

type Paso = { id: string; titulo: string; completado: boolean };

type SeguimientoData = {
  progreso:             number;
  pasos:                Paso[];
  linkDemo:             string;
  credencialesUsuario:  string;
  credencialesPassword: string;
  notas:                string;
};

const EMPTY: SeguimientoData = {
  progreso: 0, pasos: [], linkDemo: "",
  credencialesUsuario: "", credencialesPassword: "", notas: "",
};

const ESTADO_BADGE: Record<string, string> = {
  pendiente:  "badge-yellow",
  desarrollo: "badge-purple",
  revision:   "badge-blue",
  entregado:  "badge-green",
  cancelado:  "badge-red",
};

export default function SeguimientoPage() {
  const { t } = useLang();

  const [pedidos,      setPedidos]      = useState<Record<string, unknown>[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [editando,     setEditando]     = useState<Record<string, unknown> | null>(null);
  const [form,         setForm]         = useState<SeguimientoData>(EMPTY);
  const [nuevoPaso,    setNuevoPaso]    = useState("");
  const [guardando,    setGuardando]    = useState(false);
  const [seguimientos, setSeguimientos] = useState<Record<string, SeguimientoData>>({});

  useEffect(() => {
    getPedidos().then(async peds => {
      setPedidos(peds);
      const map: Record<string, SeguimientoData> = {};
      await Promise.all(peds.map(async p => {
        const s = await getSeguimiento(String(p.id));
        if (s) map[String(p.id)] = s as unknown as SeguimientoData;
      }));
      setSeguimientos(map);
      setLoading(false);
    });
  }, []);

  async function abrirEditar(p: Record<string, unknown>) {
    const s = seguimientos[String(p.id)] ?? EMPTY;
    setForm({ ...EMPTY, ...s });
    setEditando(p);
  }

  function agregarPaso() {
    if (!nuevoPaso.trim()) return;
    setForm(f => ({
      ...f,
      pasos: [...f.pasos, { id: Date.now().toString(), titulo: nuevoPaso.trim(), completado: false }],
    }));
    setNuevoPaso("");
  }

  function togglePaso(id: string) {
    setForm(f => ({ ...f, pasos: f.pasos.map(p => p.id === id ? { ...p, completado: !p.completado } : p) }));
  }

  function eliminarPaso(id: string) {
    setForm(f => ({ ...f, pasos: f.pasos.filter(p => p.id !== id) }));
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    try {
      const data = {
        ...form,
        proyecto:     editando.proyecto,
        cliente:      editando.cliente,
        clienteId:    editando.clienteId,
        estado:       editando.estado,
        fechaInicio:  editando.fecha        ?? "",
        fechaEntrega: editando.fechaEntrega ?? "",
      };
      await saveSeguimiento(String(editando.id), data as unknown as Record<string, unknown>);
      setSeguimientos(prev => ({ ...prev, [String(editando.id)]: form }));
      showToast(t.seguimientoGuardadoOk, "success");
      setEditando(null);
    } catch {
      showToast(t.seguimientoGuardadoError, "error");
    } finally {
      setGuardando(false);
    }
  }

  function copiarLink(id: string) {
    const url = `${window.location.origin}/ver/${id}`;
    navigator.clipboard.writeText(url);
    showToast(t.seguimientoLinkCopiado, "success");
  }

  return (
    <>
      {/* ── MODAL ── */}
      {editando && (
        <div className="confirm-overlay" onClick={() => setEditando(null)}>
          <div style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:540, boxShadow:"0 20px 60px rgba(0,0,0,0.18)", overflow:"hidden" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 1.25rem", borderBottom:"1px solid #f3f4f6" }}>
              <div>
                <p style={{ margin:0, fontWeight:700, fontSize:"0.92rem", color:"#0f0f1a" }}>{String(editando.proyecto ?? "")}</p>
                <p style={{ margin:0, fontSize:"0.76rem", color:"#9ca3af" }}>{String(editando.cliente ?? "")}</p>
              </div>
              <button onClick={() => setEditando(null)} style={{ background:"#f3f4f6", border:"none", borderRadius:8, padding:"0.3rem 0.45rem", cursor:"pointer", color:"#6b7280", display:"flex" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding:"1.1rem 1.25rem", display:"flex", flexDirection:"column", gap:"1rem", maxHeight:"70vh", overflowY:"auto" }}>

              {/* Progreso */}
              <div>
                <label className="form-label">
                  {t.seguimientoProgreso}: <span style={{ color:"#6c63ff", fontWeight:700 }}>{form.progreso}%</span>
                </label>
                <input type="range" min={0} max={100} step={5}
                  value={form.progreso}
                  onChange={e => setForm(f => ({ ...f, progreso: Number(e.target.value) }))}
                  style={{ width:"100%", accentColor:"#6c63ff", margin:"0.35rem 0 0" }}
                />
              </div>

              {/* Pasos */}
              <div>
                <label className="form-label">{t.seguimientoPasos}</label>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", marginBottom:"0.5rem" }}>
                  {form.pasos.length === 0 && (
                    <p style={{ fontSize:"0.78rem", color:"#9ca3af", margin:0 }}>{t.seguimientoNoPasos}</p>
                  )}
                  {form.pasos.map(paso => (
                    <div key={paso.id} style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"#f9fafb", borderRadius:6, padding:"0.4rem 0.6rem", border:"1px solid #f0f0f0" }}>
                      <button onClick={() => togglePaso(paso.id)}
                        style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${paso.completado ? "#6c63ff" : "#d1d5db"}`, background: paso.completado ? "#6c63ff" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, padding:0 }}>
                        {paso.completado && <Check size={10} color="#fff" strokeWidth={3} />}
                      </button>
                      <span style={{ flex:1, fontSize:"0.82rem", color: paso.completado ? "#9ca3af" : "#374151", textDecoration: paso.completado ? "line-through" : "none" }}>
                        {paso.titulo}
                      </span>
                      <button onClick={() => eliminarPaso(paso.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:0, display:"flex" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <input className="form-input"
                    value={nuevoPaso}
                    onChange={e => setNuevoPaso(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && agregarPaso()}
                    placeholder={t.seguimientoAgregarPaso}
                    style={{ flex:1 }}
                  />
                  <button onClick={agregarPaso} className="confirm-btn-ok"
                    style={{ flex:"none", padding:"0 1rem", display:"flex", alignItems:"center", gap:"0.3rem", borderRadius:8, fontSize:"0.8rem", fontWeight:700 }}>
                    <Plus size={14} /> Agregar
                  </button>
                </div>
              </div>

              {/* Link demo */}
              <div>
                <label className="form-label">
                  <Link2 size={12} style={{ marginRight:4, verticalAlign:"middle" }} />
                  {t.seguimientoLinkDemo}
                </label>
                <input className="form-input"
                  value={form.linkDemo}
                  onChange={e => setForm(f => ({ ...f, linkDemo: e.target.value }))}
                  placeholder={t.seguimientoLinkPH}
                />
              </div>

              {/* Credenciales */}
              <div>
                <label className="form-label">
                  <KeyRound size={12} style={{ marginRight:4, verticalAlign:"middle" }} />
                  {t.seguimientoCredenciales}
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                  <input className="form-input"
                    value={form.credencialesUsuario}
                    onChange={e => setForm(f => ({ ...f, credencialesUsuario: e.target.value }))}
                    placeholder={t.seguimientoUsuario}
                  />
                  <input className="form-input"
                    value={form.credencialesPassword}
                    onChange={e => setForm(f => ({ ...f, credencialesPassword: e.target.value }))}
                    placeholder={t.seguimientoPassword}
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="form-label">
                  <FileText size={12} style={{ marginRight:4, verticalAlign:"middle" }} />
                  {t.seguimientoNotas}
                </label>
                <textarea className="form-input"
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder={t.seguimientoNotasPH}
                  rows={3}
                  style={{ resize:"vertical", fontFamily:"inherit" }}
                />
              </div>

              {/* Acciones */}
              <div style={{ display:"flex", gap:"0.6rem", justifyContent:"flex-end", paddingTop:"0.25rem" }}>
                <button className="confirm-btn-cancel" style={{ flex:"none", padding:"0.5rem 1rem" }} onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button className="confirm-btn-ok" style={{ flex:"none", padding:"0.5rem 1.25rem", display:"flex", alignItems:"center", gap:"0.35rem" }} onClick={guardar} disabled={guardando}>
                  {guardando ? <Loader2 size={13} className="panel-loading-spin" /> : <Save size={13} />}
                  {t.seguimientoGuardar}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.seguimientoTitle}</h2>
          <p className="panel-subtitle">{t.seguimientoSubtitle}</p>
        </div>
      </div>

      {/* ── LISTA ── */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={26} className="panel-loading-spin" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="reporte-card" style={{ padding:"2rem", textAlign:"center", color:"#9ca3af" }}>
          {t.seguimientoSinPedidos}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
          {pedidos.map(p => {
            const s   = seguimientos[String(p.id)];
            const pct = s?.progreso ?? 0;
            const badgeClass = ESTADO_BADGE[String(p.estado ?? "pendiente")] ?? "badge-yellow";
            return (
              <div key={String(p.id)} className="reporte-card" style={{ padding:"0.85rem 1.1rem", marginBottom:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.2rem" }}>
                      <p style={{ margin:0, fontWeight:700, fontSize:"0.88rem", color:"#0f0f1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {String(p.proyecto ?? "—")}
                      </p>
                      <span className={`dash-badge ${badgeClass}`} style={{ fontSize:"0.68rem" }}>
                        {String(p.estado ?? "")}
                      </span>
                    </div>
                    <p style={{ margin:0, fontSize:"0.76rem", color:"#9ca3af" }}>{String(p.cliente ?? "")}</p>
                  </div>

                  {/* Barra progreso */}
                  <div style={{ width:160, flexShrink:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.7rem", color:"#6b7280", marginBottom:"0.2rem" }}>
                      <span>{t.seguimientoProgreso}</span>
                      <span style={{ fontWeight:700, color:"#6c63ff" }}>{pct}%</span>
                    </div>
                    <div style={{ height:5, borderRadius:4, background:"#f0f0f0", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:"#6c63ff", borderRadius:4 }} />
                    </div>
                    {s?.pasos?.length > 0 && (
                      <p style={{ margin:"0.2rem 0 0", fontSize:"0.68rem", color:"#9ca3af" }}>
                        {s.pasos.filter(paso => paso.completado).length}/{s.pasos.length} pasos
                        {s.linkDemo && <span style={{ marginLeft:"0.4rem", color:"#059669" }}>· Demo lista</span>}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ display:"flex", gap:"0.35rem", flexShrink:0 }}>
                    <button onClick={() => abrirEditar(p)} className="table-edit-btn" title={t.seguimientoEditar}>
                      <Pencil size={13} strokeWidth={2} />
                    </button>
                    <button onClick={() => copiarLink(String(p.id))} className="table-edit-btn" title={t.seguimientoCopiarLink}>
                      <Copy size={13} strokeWidth={2} />
                    </button>
                    <a href={`/ver/${String(p.id)}`} target="_blank" rel="noreferrer"
                      className="table-edit-btn" title={t.seguimientoVerPublico} style={{ display:"inline-flex", alignItems:"center" }}>
                      <ExternalLink size={13} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
