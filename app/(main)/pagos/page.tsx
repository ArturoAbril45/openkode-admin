"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, Search, Loader2, ExternalLink,
  CheckCircle2, AlertCircle, MinusCircle, CreditCard,
} from "lucide-react";
import Pagination  from "../../components/Pagination";
import { getPedidos } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

const PER_PAGE = 8;

function fmt(v: string | number): string {
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `$${n.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PagosPage() {
  const { t } = useLang();

  const [pedidos,     setPedidos]     = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    getPedidos().then(data => {
      setPedidos(data);
      setLoadingData(false);
    });
  }, []);

  const filtered = pedidos.filter(p =>
    String(p.proyecto ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(p.cliente  ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Summary totals (only pedidos that have montoTotal set)
  const conPago = pedidos.filter(p => p.montoTotal && String(p.montoTotal) !== "");
  const totalFacturado = conPago.reduce((s, p) => s + (parseFloat(String(p.montoTotal  ?? 0)) || 0), 0);
  const totalPagado    = conPago.reduce((s, p) => s + (parseFloat(String(p.montoPagado ?? 0)) || 0), 0);
  const totalPendiente = Math.max(0, totalFacturado - totalPagado);

  const KPIS = [
    { label: t.pagosResumenPedidos,   value: conPago.length,      color: "#6c63ff", bg: "#ede9fe", icon: CreditCard   },
    { label: t.pagosResumenFacturado, value: fmt(totalFacturado), color: "#2563eb", bg: "#dbeafe", icon: DollarSign   },
    { label: t.pagosResumenPagado,    value: fmt(totalPagado),    color: "#059669", bg: "#d1fae5", icon: CheckCircle2 },
    { label: t.pagosResumenPendiente, value: fmt(totalPendiente), color: "#dc2626", bg: "#fee2e2", icon: AlertCircle  },
  ];

  function estadoPago(p: Record<string, unknown>) {
    const total  = parseFloat(String(p.montoTotal  ?? "")) || 0;
    const pagado = parseFloat(String(p.montoPagado ?? "")) || 0;
    if (!total && !pagado) return "sin-info";
    if (pagado >= total && total > 0) return "saldado";
    return "deuda";
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.pagosTitle}</h2>
          <p className="panel-subtitle">{t.pagosSubtitle}</p>
        </div>
      </div>

      {!loadingData && (
        <div className="reporte-kpis" style={{ marginBottom: "1.5rem" }}>
          {KPIS.map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="reporte-kpi">
              <div className="reporte-kpi-icon" style={{ background: bg }}>
                <Icon size={18} strokeWidth={2} style={{ color }} />
              </div>
              <div className="reporte-kpi-info">
                <p className="reporte-kpi-value" style={{ color }}>{value}</p>
                <p className="reporte-kpi-label">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel-header" style={{ marginTop: "0.5rem" }}>
        <div>
          <p className="panel-subtitle">
            {loadingData
              ? t.pagosCargando
              : `${filtered.length} ${filtered.length !== 1 ? t.pagosPlural : t.pagosSingular}`}
          </p>
        </div>
        <div className="table-search-wrap">
          <Search size={14} className="table-search-icon" strokeWidth={1.8} />
          <input
            className="table-search-input"
            placeholder={t.pagosBuscar}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="reporte-card">
        <table className="reporte-table">
          <thead>
            <tr>
              <th>{t.dashProyecto}</th>
              <th>{t.pedidosCliente}</th>
              <th>{t.pagosMontoTotal}</th>
              <th>{t.pagosMontoPagado}</th>
              <th>{t.pagosMontoPendiente}</th>
              <th>{t.pagosEstadoPago}</th>
              <th>{t.pagosComprobante}</th>
            </tr>
          </thead>
          <tbody>
            {loadingData ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                  <Loader2 size={20} className="panel-loading-spin" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem" }}>
                  {t.pagosNinguno}
                </td>
              </tr>
            ) : paginated.map(p => {
              const total    = parseFloat(String(p.montoTotal  ?? "")) || 0;
              const pagado   = parseFloat(String(p.montoPagado ?? "")) || 0;
              const pendiente = Math.max(0, total - pagado);
              const estado = estadoPago(p);

              return (
                <tr key={String(p.id)}>
                  <td className="reporte-td-bold">{String(p.proyecto ?? "—")}</td>
                  <td>{String(p.cliente ?? "—")}</td>
                  <td className="reporte-td-gray">
                    {p.montoTotal ? fmt(String(p.montoTotal)) : "—"}
                  </td>
                  <td style={{ color: "#059669", fontWeight: 600 }}>
                    {p.montoPagado ? fmt(String(p.montoPagado)) : "—"}
                  </td>
                  <td style={{ color: pendiente > 0 ? "#dc2626" : "#9ca3af", fontWeight: pendiente > 0 ? 600 : 400 }}>
                    {(p.montoTotal || p.montoPagado) ? fmt(pendiente) : "—"}
                  </td>
                  <td>
                    {estado === "saldado" && (
                      <span className="pedido-tipo-badge estado-entregado" style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <CheckCircle2 size={11} /> {t.pagosSaldado}
                      </span>
                    )}
                    {estado === "deuda" && (
                      <span className="pedido-tipo-badge estado-pendiente" style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <AlertCircle size={11} /> {t.pagosDeuda}
                      </span>
                    )}
                    {estado === "sin-info" && (
                      <span className="pedido-tipo-badge" style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "#f3f4f6", color: "#9ca3af" }}>
                        <MinusCircle size={11} /> {t.pagosSinInfo}
                      </span>
                    )}
                  </td>
                  <td>
                    {p.comprobante ? (
                      <a
                        href={String(p.comprobante)}
                        target="_blank"
                        rel="noreferrer"
                        title={t.pagosVerComprobante}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.78rem", color: "#6c63ff", background: "#ede9fe", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: 500 }}
                      >
                        <ExternalLink size={12} strokeWidth={2} /> {t.pagosVerComprobante}
                      </a>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="table-pagination-wrap">
          <Pagination total={filtered.length} perPage={PER_PAGE} current={page} onChange={setPage} />
        </div>
      </div>
    </>
  );
}
