"use client";

import { useState, useEffect } from "react";
import {
  Bell, Package, CalendarX, Clock, AlertTriangle,
  CheckCircle2, FolderX, Zap, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { getPedidos, getProyectosCancelados } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

function diasRestantes(iso: string) {
  const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(iso + "T00:00:00");
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function formatFecha(iso: string, locale: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, {
    day: "2-digit", month: "short", year: "numeric",
  });
}

type AlertItem = { id: string; titulo: string; detalle: string };
type AlertGroup = {
  key:     string;
  icon:    React.ReactNode;
  label:   string;
  nivel:   "critico" | "advertencia" | "info" | "ok";
  items:   AlertItem[];
};

export default function AlertasPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const [pedidos,    setPedidos]    = useState<Record<string, unknown>[]>([]);
  const [cancelados, setCancelados] = useState<Record<string, unknown>[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [expandido,  setExpandido]  = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPedidos(), getProyectosCancelados()]).then(([peds, cans]) => {
      setPedidos(peds);
      setCancelados(cans);
      setLoading(false);
    });
  }, []);

  const activos = pedidos.filter(p =>
    p.estado !== "entregado" && p.estado !== "cancelado"
  );

  const vencidos = activos.filter(p =>
    p.fechaEntrega && diasRestantes(p.fechaEntrega as string) < 0
  );

  const hoy = activos.filter(p =>
    p.fechaEntrega && diasRestantes(p.fechaEntrega as string) === 0
  );

  const proximos = activos.filter(p =>
    p.fechaEntrega &&
    diasRestantes(p.fechaEntrega as string) > 0 &&
    diasRestantes(p.fechaEntrega as string) <= 7
  );

  const urgentes  = activos.filter(p => p.prioridad === "urgente");
  const pendientes = pedidos.filter(p => p.estado === "pendiente");

  const grupos: AlertGroup[] = [
    {
      key:   "vencidos",
      icon:  <CalendarX size={17} strokeWidth={2} />,
      label: t.alertasVencidas,
      nivel: vencidos.length > 0 ? "critico" : "ok",
      items: vencidos.map(p => ({
        id:      p.id as string,
        titulo:  String(p.proyecto ?? "—"),
        detalle: `${String(p.cliente ?? "—")} · ${t.alertasVencioEl} ${formatFecha(p.fechaEntrega as string, locale)}`,
      })),
    },
    {
      key:   "hoy",
      icon:  <AlertTriangle size={17} strokeWidth={2} />,
      label: t.alertasHoy,
      nivel: hoy.length > 0 ? "critico" : "ok",
      items: hoy.map(p => ({
        id:      p.id as string,
        titulo:  String(p.proyecto ?? "—"),
        detalle: `${String(p.cliente ?? "—")} · ${t.alertasEstadoLabel}: ${String(p.estado ?? "—")}`,
      })),
    },
    {
      key:   "proximos",
      icon:  <Clock size={17} strokeWidth={2} />,
      label: t.alertasProximas,
      nivel: proximos.length > 0 ? "advertencia" : "ok",
      items: proximos.map(p => {
        const dias = diasRestantes(p.fechaEntrega as string);
        return {
          id:      p.id as string,
          titulo:  String(p.proyecto ?? "—"),
          detalle: `${String(p.cliente ?? "—")} · ${t.alertasEnDias(dias)} (${formatFecha(p.fechaEntrega as string, locale)})`,
        };
      }),
    },
    {
      key:   "urgentes",
      icon:  <Zap size={17} strokeWidth={2} />,
      label: t.alertasUrgentes,
      nivel: urgentes.length > 0 ? "advertencia" : "ok",
      items: urgentes.map(p => ({
        id:      p.id as string,
        titulo:  String(p.proyecto ?? "—"),
        detalle: `${String(p.cliente ?? "—")} · ${t.alertasEstadoLabel}: ${String(p.estado ?? "—")}`,
      })),
    },
    {
      key:   "pendientes",
      icon:  <Package size={17} strokeWidth={2} />,
      label: t.alertasPendientes,
      nivel: pendientes.length > 0 ? "info" : "ok",
      items: pendientes.map(p => ({
        id:      p.id as string,
        titulo:  String(p.proyecto ?? "—"),
        detalle: `${String(p.cliente ?? "—")} · ${t.alertasPrioridadLabel}: ${String(p.prioridad ?? "—")}`,
      })),
    },
    {
      key:   "cancelados",
      icon:  <FolderX size={17} strokeWidth={2} />,
      label: t.alertasCancelados,
      nivel: cancelados.length > 0 ? "info" : "ok",
      items: cancelados.map(p => ({
        id:      p.id as string,
        titulo:  String(p.proyecto ?? "—"),
        detalle: `${String(p.cliente ?? "—")} · ${t.alertasCanceladoEl} ${formatFecha(p.fechaCancelacion as string, locale)}`,
      })),
    },
  ];

  const totalAlertas = grupos.reduce(
    (sum, g) => sum + (g.nivel !== "ok" ? g.items.length : 0), 0
  );

  const NIVEL_CONFIG = {
    critico:     { bar: "alerta-bar-critico",     badge: "alerta-badge-critico",     text: "alerta-text-critico"     },
    advertencia: { bar: "alerta-bar-advertencia", badge: "alerta-badge-advertencia", text: "alerta-text-advertencia" },
    info:        { bar: "alerta-bar-info",        badge: "alerta-badge-info",        text: "alerta-text-info"        },
    ok:          { bar: "alerta-bar-ok",          badge: "alerta-badge-ok",          text: "alerta-text-ok"          },
  };

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.alertasTitle}</h2>
          <p className="panel-subtitle">
            {totalAlertas === 0
              ? t.alertasTodoOk
              : `${totalAlertas} ${totalAlertas !== 1 ? t.alertasPlural : t.alertasSingular} ${totalAlertas !== 1 ? t.alertasActivaPlural : t.alertasActivaSingular}`}
          </p>
        </div>
        <div className="alerta-header-icon">
          <Bell size={18} strokeWidth={1.8} />
          {totalAlertas > 0 && <span className="alerta-header-badge">{totalAlertas}</span>}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      ) : (
      <div className="alerta-grupos">
        {grupos.map(g => {
          const cfg      = NIVEL_CONFIG[g.nivel];
          const abierto  = expandido === g.key;
          const tieneItems = g.items.length > 0;

          return (
            <div key={g.key} className={`alerta-grupo ${cfg.bar}`}>
              <button
                className="alerta-grupo-header"
                onClick={() => tieneItems && setExpandido(abierto ? null : g.key)}
                disabled={!tieneItems}
              >
                <div className={`alerta-grupo-icon ${cfg.text}`}>{g.icon}</div>
                <span className="alerta-grupo-label">{g.label}</span>
                <span className={`alerta-count-badge ${cfg.badge}`}>
                  {g.items.length}
                </span>
                {tieneItems && (
                  abierto
                    ? <ChevronUp  size={15} strokeWidth={2} className="alerta-chevron" />
                    : <ChevronDown size={15} strokeWidth={2} className="alerta-chevron" />
                )}
                {!tieneItems && (
                  <div className="alerta-ok-tag">
                    <CheckCircle2 size={13} strokeWidth={2} />
                    <span>{t.alertasSinPendientes}</span>
                  </div>
                )}
              </button>

              {abierto && tieneItems && (
                <div className="alerta-items">
                  {g.items.map(item => (
                    <div key={item.id} className="alerta-item">
                      <p className="alerta-item-titulo">{item.titulo}</p>
                      <p className="alerta-item-detalle">{item.detalle}</p>
                    </div>
                  ))}
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
