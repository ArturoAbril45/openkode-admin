"use client";

import { useState, useEffect } from "react";
import {
  FileDown, Users, Package, FolderCheck, FolderX,
  DollarSign, Clock, CheckCircle2, TrendingUp, Loader2,
} from "lucide-react";
import { getClientes, getPedidos, getProyectosConcluidos, getProyectosCancelados } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

const ESTADO_CLASS: Record<string, string> = {
  pendiente:  "estado-pendiente",
  desarrollo: "estado-desarrollo",
  revision:   "estado-revision",
  entregado:  "estado-entregado",
  cancelado:  "estado-cancelado",
};

const PRIO_CLASS: Record<string, string> = {
  baja: "prio-baja", media: "prio-media", alta: "prio-alta", urgente: "prio-urgente",
};

function formatFecha(iso: string, locale: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function ReporteTecnicoPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const ESTADO_LABEL: Record<string, string> = {
    pendiente: t.estadoPendiente, desarrollo: t.estadoDesarrollo,
    revision: t.estadoRevision, entregado: t.estadoEntregado, cancelado: t.estadoCancelado,
  };

  const [tab,        setTab]        = useState<"resumen"|"pedidos"|"clientes">("resumen");
  const [clientes,   setClientes]   = useState<Record<string, unknown>[]>([]);
  const [pedidos,    setPedidos]    = useState<Record<string, unknown>[]>([]);
  const [concluidos, setConcluidos] = useState<Record<string, unknown>[]>([]);
  const [cancelados, setCancelados] = useState<Record<string, unknown>[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getClientes(),
      getPedidos(),
      getProyectosConcluidos(),
      getProyectosCancelados(),
    ]).then(([c, p, co, ca]) => {
      setClientes(c); setPedidos(p); setConcluidos(co); setCancelados(ca);
      setLoading(false);
    });
  }, []);

  const totalIngresos = clientes.reduce((sum, c) => {
    const meses = parseInt(c.contrato as string) || 0;
    const valor = parseFloat(c.valorPago as string) || 0;
    return sum + ((c.tipoPago === "mensual") ? valor * meses : valor);
  }, 0);

  const activos = pedidos.filter(p => p.estado === "desarrollo" || p.estado === "revision").length;

  const STATS = [
    { label: t.reporteTotalClientes,    value: clientes.length,           icon: Users,       color: "#6c63ff", bg: "#f0effe" },
    { label: t.reporteTotalPedidos,     value: pedidos.length,            icon: Package,     color: "#3ecf8e", bg: "#edfaf4" },
    { label: t.reporteConcluidos,       value: concluidos.length,         icon: FolderCheck, color: "#10b981", bg: "#d1fae5" },
    { label: t.reporteCancelados,       value: cancelados.length,         icon: FolderX,     color: "#ef4444", bg: "#fef2f2" },
    { label: t.reporteEnDesarrollo,     value: activos,                   icon: Clock,       color: "#f59e0b", bg: "#fef9ec" },
    { label: t.reporteIngresos,         value: `$${totalIngresos.toLocaleString(locale)}`, icon: DollarSign, color: "#2563eb", bg: "#eff6ff" },
  ];

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.reporteTitle}</h2>
          <p className="panel-subtitle">{t.reporteSubtitle}</p>
        </div>
        <button className="reporte-export-btn" onClick={() => window.print()}>
          <FileDown size={15} strokeWidth={2} /> {t.reporteExportar}
        </button>
      </div>

      {loading && (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      )}
      {!loading && <><div className="reporte-kpis">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="reporte-kpi">
            <div className="reporte-kpi-icon" style={{ background: bg }}>
              <Icon size={18} color={color} strokeWidth={2} />
            </div>
            <div className="reporte-kpi-info">
              <p className="reporte-kpi-value" style={{ color }}>{value}</p>
              <p className="reporte-kpi-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="reporte-tabs">
        <button className={`reporte-tab${tab === "resumen"  ? " active" : ""}`} onClick={() => setTab("resumen")}>
          <TrendingUp size={14} strokeWidth={2} /> {t.reporteResumen}
        </button>
        <button className={`reporte-tab${tab === "pedidos"  ? " active" : ""}`} onClick={() => setTab("pedidos")}>
          <Package size={14} strokeWidth={2} /> {t.reportePedidos}
        </button>
        <button className={`reporte-tab${tab === "clientes" ? " active" : ""}`} onClick={() => setTab("clientes")}>
          <Users size={14} strokeWidth={2} /> {t.reporteClientes}
        </button>
      </div>

      {tab === "resumen" && (
        <div className="reporte-card">
          {pedidos.length === 0 ? (
            <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.83rem" }}>{t.reporteNoPedidos}</p>
          ) : (
            <table className="reporte-table">
              <thead>
                <tr>
                  <th>{t.reporteProyecto}</th><th>{t.dashCliente}</th><th>{t.reporteServicio}</th>
                  <th>{t.reporteInicio}</th><th>{t.reporteEntrega}</th><th>{t.reporteEstado}</th><th>{t.reportePrioridad}</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p.id as string}>
                    <td className="reporte-td-bold">{p.proyecto as string}</td>
                    <td>{p.cliente as string}</td>
                    <td className="reporte-td-gray">{p.servicio as string}</td>
                    <td className="reporte-td-gray">{formatFecha(p.fecha as string, locale)}</td>
                    <td className="reporte-td-gray">{formatFecha(p.fechaEntrega as string, locale)}</td>
                    <td>
                      <span className={`pedido-tipo-badge ${ESTADO_CLASS[p.estado as string] ?? ""}`} style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem" }}>
                        {ESTADO_LABEL[p.estado as string] ?? (p.estado as string)}
                      </span>
                    </td>
                    <td>
                      <span className={`pedido-tipo-badge ${PRIO_CLASS[p.prioridad as string] ?? ""}`} style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem", textTransform: "capitalize" }}>
                        {p.prioridad as string}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "pedidos" && (
        <div className="reporte-card">
          {pedidos.length === 0 ? (
            <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.83rem" }}>{t.reporteNoPedidos}</p>
          ) : (
            <table className="reporte-table">
              <thead>
                <tr><th>{t.reporteProyecto}</th><th>{t.reporteTipo}</th><th>{t.reporteTecnologias}</th><th>{t.reporteEstado}</th></tr>
              </thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p.id as string}>
                    <td className="reporte-td-bold">{p.proyecto as string}</td>
                    <td className="reporte-td-gray" style={{ textTransform: "capitalize" }}>{p.tipo as string}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {((p.tecnologias as string[]) ?? []).map(tv => (
                          <span key={tv} className="tech-chip tech-chip-sm" style={{ pointerEvents: "none" }}>{tv}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`pedido-tipo-badge ${ESTADO_CLASS[p.estado as string] ?? ""}`} style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem" }}>
                        {ESTADO_LABEL[p.estado as string] ?? (p.estado as string)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "clientes" && (
        <div className="reporte-card">
          {clientes.length === 0 ? (
            <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.83rem" }}>{t.reporteNoClientes}</p>
          ) : (
            <table className="reporte-table">
              <thead>
                <tr>
                  <th>{t.dashCliente}</th><th>{t.reporteCorreo}</th><th>{t.reportePais}</th>
                  <th>{t.dashProyecto}</th><th>{t.reporteContrato}</th><th>{t.reportePago}</th><th>{t.reporteValor}</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id as string}>
                    <td className="reporte-td-bold">{c.nombre as string}</td>
                    <td className="reporte-td-gray">{c.correo as string}</td>
                    <td>{c.pais as string}</td>
                    <td>{c.proyecto as string}</td>
                    <td className="reporte-td-gray">
                      {c.contrato as string} {parseInt(c.contrato as string) !== 1 ? t.reporteMeses : t.reporteMes}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {(c.tipoPago as string) === "mensual" ? t.reporteMensual : t.reporteUnico}
                    </td>
                    <td className="reporte-td-bold" style={{ color: "#16a34a" }}>${c.valorPago as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="reporte-seccion-title">
        <CheckCircle2 size={15} color="#3ecf8e" strokeWidth={2} />
        {t.reporteConcluidosSeccion} {concluidos.length}
      </div>
      <div className="reporte-card">
        {concluidos.length === 0 ? (
          <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.83rem" }}>{t.reporteNoProyectosConcluidos}</p>
        ) : (
          <table className="reporte-table">
            <thead>
              <tr>
                <th>{t.reporteProyecto}</th><th>{t.dashCliente}</th><th>{t.reporteServicio}</th>
                <th>{t.reporteInicio}</th><th>{t.reporteEntrega}</th><th>{t.reporteMensajeFinal}</th>
              </tr>
            </thead>
            <tbody>
              {concluidos.map(p => (
                <tr key={p.id as string}>
                  <td className="reporte-td-bold">{p.proyecto as string}</td>
                  <td>{p.cliente as string}</td>
                  <td className="reporte-td-gray">{p.servicio as string}</td>
                  <td className="reporte-td-gray">{formatFecha(p.fechaInicio as string, locale)}</td>
                  <td className="reporte-td-gray">{formatFecha(p.fechaEntrega as string, locale)}</td>
                  <td className="reporte-td-gray">
                    {(p.mensajeFinal as string) || <em style={{ color: "#c4cad4" }}>{t.reporteSinMensaje}</em>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </>}
    </>
  );
}
