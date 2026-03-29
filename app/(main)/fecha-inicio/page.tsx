"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Globe, Smartphone, Monitor, User, Layers, Loader2 } from "lucide-react";
import { getPedidos } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

function formatFecha(iso: string, locale: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function getMes(iso: string, locale: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, { month: "long", year: "numeric" });
}

const TIPO_ICON: Record<string, React.ReactNode> = {
  web:     <Globe      size={13} strokeWidth={1.8} />,
  app:     <Smartphone size={13} strokeWidth={1.8} />,
  desktop: <Monitor    size={13} strokeWidth={1.8} />,
};

const TIPO_CLASS: Record<string, string> = {
  web: "badge-web", app: "badge-app", desktop: "badge-desktop",
};

const ESTADO_CLASS: Record<string, string> = {
  pendiente:  "estado-pendiente",
  desarrollo: "estado-desarrollo",
  revision:   "estado-revision",
  entregado:  "estado-entregado",
  cancelado:  "estado-cancelado",
};

export default function FechaInicioPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const ESTADO_LABEL: Record<string, string> = {
    pendiente: t.estadoPendiente, desarrollo: t.estadoDesarrollo,
    revision: t.estadoRevision, entregado: t.estadoEntregado, cancelado: t.estadoCancelado,
  };

  const [pedidos,     setPedidos]     = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    getPedidos().then(data => { setPedidos(data); setLoadingData(false); });
  }, []);

  const sorted = [...pedidos].sort(
    (a, b) => new Date((b.fecha as string) + "T00:00:00").getTime() - new Date((a.fecha as string) + "T00:00:00").getTime()
  );

  const grupos: Record<string, Record<string, unknown>[]> = {};
  sorted.forEach(p => {
    if (!p.fecha) return;
    const mes = getMes(p.fecha as string, locale);
    if (!grupos[mes]) grupos[mes] = [];
    grupos[mes].push(p);
  });

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.fechaInicioTitle}</h2>
          <p className="panel-subtitle">{t.fechaInicioSubtitle}</p>
        </div>
      </div>

      {loadingData ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}>
          <Loader2 size={28} className="panel-loading-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="table-empty">
          <CalendarCheck size={32} color="#6c63ff" strokeWidth={1.5} />
          <p>{t.fechaInicioNoPedidos}</p>
        </div>
      ) : (
        Object.entries(grupos).map(([mes, items]) => (
          <div key={mes} className="fi-grupo">
            <div className="fi-mes-header">
              <CalendarCheck size={14} strokeWidth={2} />
              <span>{mes.charAt(0).toUpperCase() + mes.slice(1)}</span>
              <span className="fi-mes-count">{items.length}</span>
            </div>

            <div className="fi-list">
              {items.map(p => {
                const id     = p.id as string;
                const tipo   = (p.tipo as string) ?? "web";
                const fecha  = p.fecha as string;
                const estado = (p.estado as string) ?? "pendiente";
                return (
                  <div key={id} className="fi-row">
                    <div className="fi-row-fecha">
                      <span className="fi-fecha-dia">
                        {new Date(fecha + "T00:00:00").getDate().toString().padStart(2, "0")}
                      </span>
                      <span className="fi-fecha-mes">
                        {new Date(fecha + "T00:00:00").toLocaleDateString(locale, { month: "short" })}
                      </span>
                    </div>

                    <div className={`fi-tipo-badge pedido-tipo-badge ${TIPO_CLASS[tipo] ?? ""}`} style={{ padding: "0.2rem 0.55rem", fontSize: "0.72rem" }}>
                      {TIPO_ICON[tipo]}
                    </div>

                    <div className="fi-row-info">
                      <span className="fi-proyecto">{p.proyecto as string}</span>
                      <span className="fi-cliente"><User size={11} strokeWidth={1.8} /> {p.cliente as string} · <Layers size={11} strokeWidth={1.8} /> {p.servicio as string}</span>
                    </div>

                    <span className={`pedido-tipo-badge ${ESTADO_CLASS[estado] ?? ""}`} style={{ padding: "0.22rem 0.7rem", fontSize: "0.73rem", flexShrink: 0 }}>
                      {ESTADO_LABEL[estado] ?? estado}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </>
  );
}
