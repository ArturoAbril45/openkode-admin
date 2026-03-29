"use client";

import { useState, useEffect } from "react";
import { Users, Package, MessageSquare, FolderX, FolderCheck, CalendarClock, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getClientes, getPedidos, getProyectosCancelados, getProyectosConcluidos } from "../../lib/services";
import DonutChart from "../../components/DonutChart";
import BarChart   from "../../components/BarChart";
import { useLang } from "../../lib/LangContext";

function getPedidosPorMes(pedidos: Record<string, unknown>[], locale: string) {
  const meses = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString(locale, { month: "short" });
    const value = pedidos.filter(p => {
      if (!p.fecha) return false;
      const f = new Date((p.fecha as string) + "T00:00:00");
      return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear();
    }).length;
    meses.push({ label, value });
  }
  return meses;
}

function diasRestantes(iso: string) {
  const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(iso + "T00:00:00");
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const [clientes,   setClientes]   = useState<Record<string, unknown>[]>([]);
  const [pedidos,    setPedidos]    = useState<Record<string, unknown>[]>([]);
  const [cancelados, setCancelados] = useState<Record<string, unknown>[]>([]);
  const [concluidos, setConcluidos] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    getClientes().then(setClientes);
    getPedidos().then(setPedidos);
    getProyectosCancelados().then(setCancelados);
    getProyectosConcluidos().then(setConcluidos);
  }, []);

  const enDesarrollo = pedidos.filter(p => p.estado === "desarrollo").length;

  const CARDS = [
    { label: t.navClientes,      value: String(clientes.length),   icon: Users,        color: "#6c63ff", bg: "#f0effe" },
    { label: t.navPedidos,       value: String(pedidos.length),    icon: Package,      color: "#3ecf8e", bg: "#edfaf4" },
    { label: t.dashEnDesarrollo, value: String(enDesarrollo),      icon: MessageSquare,color: "#f59e0b", bg: "#fef9ec" },
    { label: t.dashCancelados,   value: String(cancelados.length), icon: FolderX,      color: "#ef4444", bg: "#fef2f2" },
  ];

  const DONUT_SLICES = [
    { label: t.dashPendiente,    value: pedidos.filter(p => p.estado === "pendiente").length,  color: "#94a3b8" },
    { label: t.dashDesarrollo,   value: pedidos.filter(p => p.estado === "desarrollo").length, color: "#6c63ff" },
    { label: t.dashRevision,     value: pedidos.filter(p => p.estado === "revision").length,   color: "#9333ea" },
    { label: t.dashEntregado,    value: pedidos.filter(p => p.estado === "entregado").length,  color: "#3ecf8e" },
  ];

  const SHORTCUTS = [
    { href: "/clientes",             icon: Users,         label: t.navClientes,      color: "#6c63ff", bg: "#f0effe" },
    { href: "/pedidos",              icon: Package,       label: t.navPedidos,       color: "#3ecf8e", bg: "#edfaf4" },
    { href: "/mensajes",             icon: MessageSquare, label: t.navMensajes,      color: "#f59e0b", bg: "#fef9ec" },
    { href: "/proyectos",            icon: FolderCheck,   label: t.navProyectos,     color: "#10b981", bg: "#d1fae5" },
    { href: "/proyectos-cancelados", icon: FolderX,       label: t.navCancelados,    color: "#ef4444", bg: "#fef2f2" },
    { href: "/fecha-entrega",        icon: CalendarClock, label: t.navFechaEntrega,  color: "#8b5cf6", bg: "#ede9fe" },
  ];

  const barData = getPedidosPorMes(pedidos, locale);

  const pedidosActivos = pedidos
    .filter(p => p.estado === "pendiente" || p.estado === "desarrollo" || p.estado === "revision")
    .slice(0, 5);

  const ESTADO_LABEL: Record<string, string> = {
    pendiente: t.dashPendiente, desarrollo: t.dashDesarrollo, revision: t.dashRevision,
  };
  const ESTADO_BADGE: Record<string, string> = {
    pendiente: "badge-yellow", desarrollo: "badge-purple", revision: "badge-blue",
  };

  const pedidosPlazo = [...pedidos]
    .filter(p => p.fechaEntrega && p.estado !== "entregado" && p.estado !== "cancelado")
    .sort((a, b) => new Date((a.fechaEntrega as string) + "T00:00:00").getTime() - new Date((b.fechaEntrega as string) + "T00:00:00").getTime())
    .slice(0, 5);

  function plazoBadge(p: Record<string, unknown>) {
    const dias = diasRestantes(p.fechaEntrega as string);
    if (dias < 0)   return { label: t.dashVencido, cls: "badge-red" };
    if (dias === 0) return { label: t.dashHoy,     cls: "badge-red" };
    if (dias <= 3)  return { label: `${dias}d`,    cls: "badge-red" };
    if (dias <= 7)  return { label: `${dias}d`,    cls: "badge-yellow" };
    return               { label: `${dias}d`,      cls: "badge-green" };
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.dashTitle}</h2>
          <p className="panel-subtitle">{t.dashSubtitle}</p>
        </div>
      </div>

      <div className="dash-cards">
        {CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="dash-card">
            <div className="dash-card-icon" style={{ background: bg }}>
              <Icon size={22} color={color} strokeWidth={2} />
            </div>
            <div className="dash-card-info">
              <p className="dash-card-value" style={{ color }}>{value}</p>
              <p className="dash-card-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="dash-section-title">{t.dashShortcuts}</p>
      <div className="dash-shortcuts">
        {SHORTCUTS.map(({ href, icon: Icon, label, color, bg }) => (
          <Link key={href} href={href} className="dash-shortcut">
            <div className="dash-shortcut-icon" style={{ background: bg }}>
              <Icon size={18} color={color} strokeWidth={2} />
            </div>
            <span className="dash-shortcut-label">{label}</span>
            <ChevronRight size={14} color="#c4cad4" style={{ marginLeft: "auto" }} />
          </Link>
        ))}
      </div>

      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <p className="dash-chart-title">{t.dashPedidosMes}</p>
          <BarChart bars={barData} color="#6c63ff" height={130} />
        </div>
        <div className="dash-chart-card">
          <p className="dash-chart-title">{t.dashPedidosEstado}</p>
          <DonutChart slices={DONUT_SLICES} size={150} />
        </div>
      </div>

      <div className="dash-pedidos-grid">

        <div className="dash-pedidos-card">
          <div className="dash-pedidos-header">
            <Clock size={16} color="#6c63ff" strokeWidth={2} />
            <span>{t.dashPedidosActivos}</span>
          </div>
          {pedidosActivos.length === 0 ? (
            <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.82rem" }}>{t.dashNoPedidosActivos}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t.dashProyecto}</th>
                  <th>{t.dashCliente}</th>
                  <th>{t.dashEstado}</th>
                </tr>
              </thead>
              <tbody>
                {pedidosActivos.map(p => (
                  <tr key={p.id as string}>
                    <td className="dash-table-id">{p.proyecto as string}</td>
                    <td>{p.cliente as string}</td>
                    <td>
                      <span className={`dash-badge ${ESTADO_BADGE[p.estado as string] ?? "badge-yellow"}`}>
                        {ESTADO_LABEL[p.estado as string] ?? (p.estado as string)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dash-pedidos-card">
          <div className="dash-pedidos-header">
            <AlertTriangle size={16} color="#ef4444" strokeWidth={2} />
            <span>{t.dashPedidosPlazo}</span>
          </div>
          {pedidosPlazo.length === 0 ? (
            <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.82rem" }}>{t.dashNoPedidosPlazo}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t.dashProyecto}</th>
                  <th>{t.dashCliente}</th>
                  <th>{t.dashPlazo}</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPlazo.map(p => {
                  const { label, cls } = plazoBadge(p);
                  return (
                    <tr key={p.id as string}>
                      <td className="dash-table-id">{p.proyecto as string}</td>
                      <td>{p.cliente as string}</td>
                      <td>
                        <span className={`dash-badge ${cls}`}>{label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}
