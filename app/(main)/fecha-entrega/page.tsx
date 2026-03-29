"use client";

import { useState, useEffect } from "react";
import { CalendarClock, AlertTriangle, Clock, CheckCircle2, User, Globe, Smartphone, Monitor, Loader2 } from "lucide-react";
import { getPedidos } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

function diasRestantes(iso: string) {
  const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(iso + "T00:00:00");
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function formatFecha(iso: string, locale: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const TIPO_ICON: Record<string, React.ReactNode> = {
  web:     <Globe      size={13} strokeWidth={1.8} />,
  app:     <Smartphone size={13} strokeWidth={1.8} />,
  desktop: <Monitor    size={13} strokeWidth={1.8} />,
};

export default function FechaEntregaPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const [pedidos,     setPedidos]     = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    getPedidos().then(data => { setPedidos(data); setLoadingData(false); });
  }, []);

  const sorted = [...pedidos]
    .filter(p => p.estado !== "cancelado")
    .sort((a, b) => new Date((a.fechaEntrega as string) + "T00:00:00").getTime() - new Date((b.fechaEntrega as string) + "T00:00:00").getTime());

  const vencidos   = sorted.filter(p => diasRestantes(p.fechaEntrega as string) < 0  && p.estado !== "entregado").length;
  const urgentes   = sorted.filter(p => diasRestantes(p.fechaEntrega as string) <= 3 && diasRestantes(p.fechaEntrega as string) >= 0 && p.estado !== "entregado").length;
  const entregados = sorted.filter(p => p.estado === "entregado").length;

  function BadgeEstado({ dias, estado }: { dias: number; estado: string }) {
    if (estado === "entregado") return (
      <span className="fe-badge fe-badge-ok"><CheckCircle2 size={12} strokeWidth={2} /> {t.fechaEntregaEntregado}</span>
    );
    if (dias < 0)   return <span className="fe-badge fe-badge-vencido"><AlertTriangle size={12} strokeWidth={2} /> {t.fechaEntregaVencidoHace} {Math.abs(dias)}{t.diaSingular[0]}</span>;
    if (dias === 0) return <span className="fe-badge fe-badge-hoy"><AlertTriangle size={12} strokeWidth={2} /> {t.fechaEntregaVenceHoy}</span>;
    if (dias <= 3)  return <span className="fe-badge fe-badge-urgente"><Clock size={12} strokeWidth={2} /> {dias} {dias !== 1 ? t.diasPlural : t.diaSingular}</span>;
    if (dias <= 7)  return <span className="fe-badge fe-badge-proximo"><Clock size={12} strokeWidth={2} /> {dias} {t.diasPlural}</span>;
    return <span className="fe-badge fe-badge-normal"><Clock size={12} strokeWidth={2} /> {dias} {t.diasPlural}</span>;
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.fechaEntregaTitle}</h2>
          <p className="panel-subtitle">{t.fechaEntregaSubtitle}</p>
        </div>
      </div>

      {loadingData ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      ) : (
        <>
          <div className="fe-resumen">
            <div className="fe-resumen-item fe-res-vencido">
              <AlertTriangle size={16} strokeWidth={2} />
              <span><strong>{vencidos}</strong> {vencidos !== 1 ? t.fechaEntregaVencidosPlu : t.fechaEntregaVencidosSing}</span>
            </div>
            <div className="fe-resumen-item fe-res-urgente">
              <Clock size={16} strokeWidth={2} />
              <span><strong>{urgentes}</strong> {urgentes !== 1 ? t.fechaEntregaUrgentesPlu : t.fechaEntregaUrgentesSing} {t.fechaEntregaTresDias}</span>
            </div>
            <div className="fe-resumen-item fe-res-ok">
              <CheckCircle2 size={16} strokeWidth={2} />
              <span><strong>{entregados}</strong> {entregados !== 1 ? t.fechaEntregaEntregadosPlu : t.fechaEntregaEntregadosSing}</span>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="table-empty">
              <CalendarClock size={32} color="#6c63ff" strokeWidth={1.5} />
              <p>{t.fechaEntregaNoPedidos}</p>
            </div>
          ) : (
            <div className="fe-list">
              {sorted.map(p => {
                const id    = p.id as string;
                const tipo  = (p.tipo as string) ?? "web";
                const dias  = diasRestantes(p.fechaEntrega as string);
                const rowClass = p.estado === "entregado" ? "fe-row-ok"
                  : dias < 0  ? "fe-row-vencido"
                  : dias <= 3 ? "fe-row-urgente"
                  : "";
                return (
                  <div key={id} className={`fe-row ${rowClass}`}>
                    <div className="fe-row-left">
                      <div className="fe-tipo-icon">{TIPO_ICON[tipo]}</div>
                      <div className="fe-row-info">
                        <span className="fe-row-proyecto">{p.proyecto as string}</span>
                        <span className="fe-row-cliente"><User size={11} strokeWidth={1.8} /> {p.cliente as string}</span>
                      </div>
                    </div>
                    <div className="fe-row-center">
                      <CalendarClock size={13} strokeWidth={1.8} />
                      <span>{formatFecha(p.fechaEntrega as string, locale)}</span>
                    </div>
                    <BadgeEstado dias={dias} estado={p.estado as string} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
</>
  );
}
