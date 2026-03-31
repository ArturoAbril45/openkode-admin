"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, Search, Loader2,
  CheckCircle2, AlertCircle, MinusCircle, CreditCard, Eye, X,
  ChevronLeft, ChevronRight,
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

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || url.includes("cloudinary.com");
}

export default function PagosPage() {
  const { t } = useLang();

  const [pedidos,      setPedidos]      = useState<Record<string, unknown>[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [modalList,    setModalList]    = useState<string[]>([]);
  const [modalIdx,     setModalIdx]     = useState(0);
  const [modalProyecto, setModalProyecto] = useState("");

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

  const conPago        = pedidos.filter(p => p.montoTotal && String(p.montoTotal) !== "");
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
      {/* ── Modal comprobante ── */}
      {modalList.length > 0 && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setModalList([])}
        >
          <div
            style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", position: "relative" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f0", gap: "1rem" }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "#1f2937" }}>{modalProyecto}</p>
              {modalList.length > 1 && (
                <span style={{ fontSize: "0.78rem", color: "#6b7280", whiteSpace: "nowrap" }}>{modalIdx + 1} / {modalList.length}</span>
              )}
              <button
                onClick={() => setModalList([])}
                style={{ background: "#f3f4f6", border: "none", borderRadius: "6px", padding: "0.3rem 0.5rem", cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280", marginLeft: "auto" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ overflow: "auto", maxHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
              {isImage(modalList[modalIdx]) ? (
                <img
                  src={modalList[modalIdx]}
                  alt="Comprobante"
                  style={{ maxWidth: "80vw", maxHeight: "75vh", objectFit: "contain", display: "block" }}
                />
              ) : (
                <iframe
                  src={modalList[modalIdx]}
                  style={{ width: "80vw", height: "75vh", border: "none" }}
                  title="Comprobante PDF"
                />
              )}
            </div>
            {modalList.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setModalIdx(i => Math.max(0, i - 1)); }}
                  disabled={modalIdx === 0}
                  style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: modalIdx === 0 ? "default" : "pointer", opacity: modalIdx === 0 ? 0.3 : 1, color: "#fff" }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setModalIdx(i => Math.min(modalList.length - 1, i + 1)); }}
                  disabled={modalIdx === modalList.length - 1}
                  style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: modalIdx === modalList.length - 1 ? "default" : "pointer", opacity: modalIdx === modalList.length - 1 ? 0.3 : 1, color: "#fff" }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

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
              const total     = parseFloat(String(p.montoTotal  ?? "")) || 0;
              const pagado    = parseFloat(String(p.montoPagado ?? "")) || 0;
              const pendiente = Math.max(0, total - pagado);
              const estado    = estadoPago(p);

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
                    {(() => {
                      const comps = Array.isArray(p.comprobantes)
                        ? (p.comprobantes as string[]).filter(Boolean)
                        : p.comprobante ? [String(p.comprobante)] : [];
                      return comps.length > 0 ? (
                        <button
                          onClick={() => { setModalList(comps); setModalIdx(0); setModalProyecto(String(p.proyecto ?? "")); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "#6c63ff", background: "#ede9fe", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: 500, border: "none", cursor: "pointer" }}
                        >
                          <Eye size={12} strokeWidth={2} /> {t.pagosVerComprobante}{comps.length > 1 ? ` (${comps.length})` : ""}
                        </button>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>—</span>
                      );
                    })()}
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
