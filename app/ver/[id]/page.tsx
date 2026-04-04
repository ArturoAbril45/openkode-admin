"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2, Check, ExternalLink, KeyRound, Copy, ChevronRight,
} from "lucide-react";
import { getSeguimiento } from "../../lib/services";

type Paso = { id: string; titulo: string; completado: boolean };

type SeguimientoData = {
  proyecto:             string;
  cliente:              string;
  estado?:              string;
  progreso:             number;
  pasos:                Paso[];
  linkDemo:             string;
  credencialesUsuario:  string;
  credencialesPassword: string;
  notas:                string;
  fechaInicio?:         string;
  fechaEntrega?:        string;
};

const ESTADO_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pendiente:  { bg: "#fef3c7", color: "#d97706", label: "PENDIENTE"  },
  desarrollo: { bg: "#ede9fe", color: "#6c63ff", label: "DESARROLLO" },
  revision:   { bg: "#e0e7ff", color: "#4f46e5", label: "REVISIÓN"   },
  entregado:  { bg: "#d1fae5", color: "#059669", label: "ENTREGADO"  },
  cancelado:  { bg: "#fee2e2", color: "#ef4444", label: "CANCELADO"  },
};

export default function VerProyectoPage() {
  const params = useParams();
  const id     = String(params.id ?? "");

  const [data,     setData]     = useState<SeguimientoData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    if (!id) return;
    getSeguimiento(id)
      .then(s => {
        if (s) {
          setData(s as unknown as SeguimientoData);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  function copiarCredencial(val: string) {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f3f4f8" }}>
      <Loader2 size={30} style={{ color:"#6c63ff", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound || !data) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f3f4f8", gap:"0.75rem" }}>
      <div style={{ fontSize:"2.5rem" }}>🔍</div>
      <p style={{ fontWeight:700, fontSize:"1rem", color:"#374151", margin:0 }}>Proyecto no encontrado</p>
      <p style={{ color:"#9ca3af", fontSize:"0.82rem", margin:0 }}>Verifica el enlace que te compartieron.</p>
    </div>
  );

  const completados = data.pasos.filter(p => p.completado).length;
  const total       = data.pasos.length;
  const estadoInfo  = ESTADO_BADGE[data.estado ?? "pendiente"] ?? ESTADO_BADGE.pendiente;

  // Determina el índice activo del stepper (primer paso no completado)
  const stepperIdx  = data.pasos.findIndex(p => !p.completado);
  const activeStep  = stepperIdx === -1 ? total - 1 : stepperIdx;

  return (
    <div style={{ minHeight:"100vh", background:"#f3f4f8", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* ── TOPBAR ── */}
      <header style={{ background:"#0d1b3e", padding:"0 2rem", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0" }}>
          <span style={{ fontWeight:900, fontSize:"1.35rem", letterSpacing:"-0.5px", color:"#ffffff" }}>OPEN</span>
          <span style={{ fontWeight:900, fontSize:"1.35rem", letterSpacing:"-0.5px", color:"#2563eb" }}>KODE</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          <div style={{ textAlign:"right" }}>
            <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:"0.8rem" }}>{data.cliente}</p>
            <p style={{ margin:0, color:"#94a3b8", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>Cliente</p>
          </div>
          <div style={{ width:34, height:34, borderRadius:50, background:"#6c63ff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:"0.85rem" }}>
            {(data.cliente ?? "C").charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* ── BREADCRUMB ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0.55rem 2rem", display:"flex", alignItems:"center", gap:"0.35rem", fontSize:"0.78rem" }}>
        <span style={{ color:"#6b7280" }}>Inicio</span>
        <ChevronRight size={12} style={{ color:"#d1d5db" }} />
        <span style={{ color:"#6c63ff", fontWeight:600 }}>Estado del proyecto</span>
      </div>

      {/* ── TÍTULO ── */}
      <div style={{ padding:"1.5rem 2rem 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        <div style={{ borderLeft:"4px solid #6c63ff", paddingLeft:"0.85rem" }}>
          <h1 style={{ margin:0, fontSize:"1.35rem", fontWeight:800, color:"#0d1b3e" }}>Estado del Proyecto</h1>
          <p style={{ margin:0, fontSize:"0.82rem", color:"#6b7280", marginTop:"0.2rem" }}>Seguimiento en tiempo real de tu desarrollo.</p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ padding:"1.25rem 2rem 3rem", display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.25rem", maxWidth:1100, margin:"0 auto" }}>

        {/* ── CARD IZQUIERDA ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

          {/* Progreso */}
          <div style={{ background:"#fff", borderRadius:8, padding:"1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e5e7eb" }}>
            <p style={{ margin:"0 0 0.2rem", fontWeight:800, fontSize:"0.95rem", color:"#0d1b3e" }}>Progreso del Proyecto</p>
            <p style={{ margin:"0 0 1rem", fontSize:"0.75rem", color:"#9ca3af" }}>Seguimiento paso a paso de tu desarrollo.</p>

            {/* Barra principal con % */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" }}>
              <div style={{ flex:1, height:10, borderRadius:99, background:"#f3f4f6", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${data.progreso}%`, background:"#6c63ff", borderRadius:99, transition:"width 0.5s" }} />
              </div>
              <span style={{ fontWeight:800, fontSize:"1rem", color:"#6c63ff", minWidth:"3rem", textAlign:"right" }}>{data.progreso}%</span>
            </div>

            {/* Stepper */}
            {total > 0 && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:0, overflowX:"auto", paddingBottom:"0.5rem", paddingTop:"0.25rem" }}>
                {data.pasos.map((paso, i) => {
                  const done   = paso.completado;
                  const active = i === activeStep && !done;
                  return (
                    <div key={paso.id} style={{ display:"flex", alignItems:"flex-start", flex:1, minWidth:64 }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                        {/* círculo */}
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: done ? "#0d1b3e" : active ? "#fff" : "#f3f4f6",
                          border: active ? "2.5px solid #6c63ff" : done ? "none" : "2px solid #e5e7eb",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: "0.82rem",
                          color: done ? "#fff" : active ? "#6c63ff" : "#9ca3af",
                          flexShrink: 0, zIndex: 1,
                        }}>
                          {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                        </div>
                        {/* label */}
                        <p style={{ margin:"0.35rem 0 0", fontSize:"0.68rem", fontWeight: active ? 700 : 500, color: active ? "#6c63ff" : done ? "#374151" : "#9ca3af", textAlign:"center", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:90 }}>
                          {paso.titulo}
                        </p>
                      </div>
                      {/* línea entre pasos */}
                      {i < total - 1 && (
                        <div style={{ height:2, flex:1, background: done ? "#0d1b3e" : "#e5e7eb", marginTop:17, minWidth:16 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notas / descripción */}
          {data.notas && (
            <div style={{ background:"#fff", borderRadius:8, padding:"1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e5e7eb" }}>
              <p style={{ margin:"0 0 0.75rem", fontSize:"0.72rem", fontWeight:800, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Descripción del proceso</p>
              <p style={{ margin:0, fontSize:"0.87rem", color:"#374151", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{data.notas}</p>
            </div>
          )}

          {/* Credenciales */}
          {(data.credencialesUsuario || data.credencialesPassword) && (
            <div style={{ background:"#fff", borderRadius:8, padding:"1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e5e7eb" }}>
              <p style={{ margin:"0 0 1rem", fontSize:"0.72rem", fontWeight:800, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Credenciales de prueba</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {data.credencialesUsuario && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.6rem 0.85rem", background:"#f9fafb", borderRadius:8, border:"1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ margin:0, fontSize:"0.68rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Usuario</p>
                      <p style={{ margin:0, fontFamily:"monospace", fontSize:"0.9rem", fontWeight:700, color:"#374151" }}>{data.credencialesUsuario}</p>
                    </div>
                    <button onClick={() => copiarCredencial(data.credencialesUsuario)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#6c63ff", padding:"0.25rem" }} title="Copiar">
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {data.credencialesPassword && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.6rem 0.85rem", background:"#f9fafb", borderRadius:8, border:"1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ margin:0, fontSize:"0.68rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Contraseña</p>
                      <p style={{ margin:0, fontFamily:"monospace", fontSize:"0.9rem", fontWeight:700, color:"#374151" }}>{data.credencialesPassword}</p>
                    </div>
                    <button onClick={() => copiarCredencial(data.credencialesPassword)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#6c63ff", padding:"0.25rem" }} title="Copiar">
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
              {copied && <p style={{ margin:"0.5rem 0 0", fontSize:"0.72rem", color:"#059669", fontWeight:600 }}>¡Copiado!</p>}
            </div>
          )}
        </div>

        {/* ── SIDEBAR DERECHA ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

          {/* Detalles */}
          <div style={{ background:"#fff", borderRadius:8, padding:"1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e5e7eb" }}>
            <p style={{ margin:"0 0 1rem", fontWeight:800, fontSize:"0.95rem", color:"#0d1b3e" }}>Detalles del Proyecto</p>
            <p style={{ margin:"0 0 1rem", fontSize:"0.75rem", color:"#9ca3af" }}>Información del proceso registrado.</p>

            {/* Estado badge */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", paddingBottom:"1rem", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:"0.75rem", color:"#6b7280", fontWeight:600 }}>{data.proyecto}</span>
              <span style={{ fontSize:"0.72rem", fontWeight:800, padding:"0.2rem 0.65rem", borderRadius:8, background:estadoInfo.bg, color:estadoInfo.color }}>
                ● {estadoInfo.label}
              </span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.72rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Cliente</span>
                <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#374151" }}>{data.cliente}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.72rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Progreso</span>
                <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#6c63ff" }}>{data.progreso}%</span>
              </div>
              {total > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.72rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Pasos</span>
                  <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#374151" }}>{completados} / {total}</span>
                </div>
              )}
              {data.fechaInicio && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.72rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Inicio</span>
                  <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#374151" }}>{data.fechaInicio}</span>
                </div>
              )}
              {data.fechaEntrega && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.72rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Entrega máx.</span>
                  <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#ef4444" }}>{data.fechaEntrega}</span>
                </div>
              )}
            </div>

            {/* Demo button */}
            {data.linkDemo && (
              <a href={data.linkDemo} target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.4rem", marginTop:"1.25rem", padding:"0.6rem", border:"1.5px solid #e5e7eb", borderRadius:8, textDecoration:"none", color:"#374151", fontSize:"0.82rem", fontWeight:600 }}>
                <ExternalLink size={14} style={{ color:"#6c63ff" }} />
                Abrir Demo
              </a>
            )}
          </div>

          {/* Aviso info */}
          <div style={{ background:"#f5f3ff", borderRadius:8, padding:"1rem 1.1rem", border:"1px solid #ede9fe", display:"flex", alignItems:"flex-start", gap:"0.6rem" }}>
            <div style={{ color:"#6c63ff", marginTop:2, flexShrink:0 }}>
              <KeyRound size={15} />
            </div>
            <p style={{ margin:0, fontSize:"0.78rem", color:"#5b21b6", lineHeight:1.5 }}>
              {data.linkDemo
                ? "Tu aplicación ya está lista para probar. Accede con las credenciales de prueba."
                : "Tu proyecto está en desarrollo. Te avisaremos cuando la demo esté disponible."}
            </p>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:"#fff", borderTop:"1px solid #e5e7eb", textAlign:"center", padding:"1.25rem 2rem" }}>
        <span style={{ fontSize:"0.72rem", color:"#9ca3af" }}>
          © 2026 <span style={{ fontWeight:900, color:"#0f0f1a" }}>OPEN</span><span style={{ fontWeight:900, color:"#2563eb" }}>KODE</span> — Todos los derechos reservados
        </span>
      </div>

      {/* responsive */}
      <style>{`
        @media(max-width:700px){
          div[style*="grid-template-columns"]{
            grid-template-columns:1fr !important;
          }
          div[style*="padding:1.25rem 2rem"]{
            padding:1rem !important;
          }
          header[style]{
            padding:0 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
