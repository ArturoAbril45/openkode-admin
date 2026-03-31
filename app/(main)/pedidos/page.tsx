"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, Globe, Monitor, Smartphone, MessageSquare, Save,
  Layers, Zap, Activity, Code2, Search, CalendarCheck, CalendarClock,
  FolderOpen, Loader2, Pencil, X, Trash2,
  DollarSign, Upload, FileCheck, ExternalLink, FileText, Wallet,
} from "lucide-react";
import CustomSelect  from "../../components/CustomSelect";
import DatePicker    from "../../components/DatePicker";
import ConfirmModal  from "../../components/ConfirmModal";
import Pagination    from "../../components/Pagination";
import { showToast } from "../../components/Toast";
import { getPedidos, addPedido, updatePedido, deletePedido, getClientes, syncPedidoCancelado, syncPedidoConcluido, removeProyectoCancelado, removeProyectoConcluido, uploadComprobante } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

const TECNOLOGIAS = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "React Native", "Flutter", "Ionic", "Swift", "Kotlin",
  "Node.js", "Express", "NestJS", "Laravel", "Django",
  "FastAPI", "Spring Boot", "ASP.NET", "Ruby on Rails",
  "WordPress", "Shopify", "Webflow",
  "PostgreSQL", "MySQL", "MongoDB", "Firebase", "Supabase",
  "GraphQL", "REST API", "TypeScript", "Python", "PHP",
  "Docker", "AWS", "Vercel", "Tailwind CSS", "Bootstrap",
];

const PRIORIDAD_COLORS: Record<string, string> = {
  baja: "prio-baja", media: "prio-media", alta: "prio-alta", urgente: "prio-urgente",
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente:  "estado-pendiente",
  desarrollo: "estado-desarrollo",
  revision:   "estado-revision",
  entregado:  "estado-entregado",
  cancelado:  "estado-cancelado",
};

function formatFecha(iso: string, locale: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

const PER_PAGE = 5;

const EMPTY_FORM = {
  clienteId:         "",
  cliente:           "",
  proyecto:          "",
  tipo:              "",
  servicio:          "",
  prioridad:         "",
  estado:            "",
  fecha:             "",
  fechaEntrega:      "",
  mensaje:           "",
  contrato:          "",
  tipoPago:          "",
  valorPago:         "",
  montoTotal:        "",
  montoPagado:       "",
  comprobante:       "",
  comprobanteNombre: "",
};

export default function PedidosPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const TIPOS_PROYECTO = [
    { value: "web",     label: t.tipoWeb     },
    { value: "app",     label: t.tipoApp     },
    { value: "desktop", label: t.tipoDesktop },
  ];

  const SERVICIOS = [
    { value: "landing",       label: t.srvLanding    },
    { value: "ecommerce",     label: t.srvEcommerce  },
    { value: "auth",          label: t.srvAuth       },
    { value: "api",           label: t.srvApi        },
    { value: "dashboard",     label: t.srvDashboard  },
    { value: "blog",          label: t.srvBlog       },
    { value: "portfolio",     label: t.srvPortfolio  },
    { value: "crm",           label: t.srvCrm        },
    { value: "erp",           label: t.srvErp        },
    { value: "pos",           label: t.srvPos        },
    { value: "booking",       label: t.srvBooking    },
    { value: "chat",          label: t.srvChat       },
    { value: "streaming",     label: t.srvStreaming  },
    { value: "marketplace",   label: t.srvMarketplace},
    { value: "saas",          label: t.srvSaas       },
    { value: "social",        label: t.srvSocial     },
    { value: "maps",          label: t.srvMaps       },
    { value: "notifications", label: t.srvNotif      },
    { value: "payments",      label: t.srvPayments   },
    { value: "ia",            label: t.srvIa         },
    { value: "scraping",      label: t.srvScraping   },
    { value: "other",         label: t.srvOther      },
  ];

  const PRIORIDADES = [
    { value: "baja",    label: t.prioBaja    },
    { value: "media",   label: t.prioMedia   },
    { value: "alta",    label: t.prioAlta    },
    { value: "urgente", label: t.prioUrgente },
  ];

  const ESTADOS = [
    { value: "pendiente",  label: t.estadoPendiente  },
    { value: "desarrollo", label: t.estadoDesarrollo },
    { value: "revision",   label: t.estadoRevision   },
    { value: "entregado",  label: t.estadoEntregado  },
    { value: "cancelado",  label: t.estadoCancelado  },
  ];

  const SERVICIOS_LABEL: Record<string, string> = Object.fromEntries(
    SERVICIOS.map(s => [s.value, s.label])
  );

  const [form,        setForm]        = useState(EMPTY_FORM);
  const [tecnologias, setTecnologias] = useState<string[]>([]);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [confirm,     setConfirm]     = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const [pedidos,     setPedidos]     = useState<Record<string, unknown>[]>([]);
  const [clienteOpts, setClienteOpts] = useState<{ value: string; label: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const formRef             = useRef<HTMLDivElement>(null);
  const comprobanteInputRef = useRef<HTMLInputElement>(null);
  const [comprobanteFile,   setComprobanteFile]   = useState<File | null>(null);
  const [uploadingComp,     setUploadingComp]     = useState(false);

  useEffect(() => {
    Promise.all([getPedidos(), getClientes()]).then(([peds, clts]) => {
      setPedidos(peds);
      setClienteOpts(
        clts.map((c: Record<string, unknown>) => ({
          value: c.id as string,
          label: c.nombre as string,
        }))
      );
      setLoadingData(false);
    });
  }, []);

  function toggleTech(tv: string) {
    setTecnologias(prev =>
      prev.includes(tv) ? prev.filter(x => x !== tv) : [...prev, tv]
    );
  }

  function clearField(name: string) {
    setErrors(er => { const n = { ...er }; delete n[name]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.cliente)         e.cliente      = t.pedidosSelClienteError;
    if (!form.proyecto.trim()) e.proyecto     = t.pedidosNombreError;
    if (!form.tipo)            e.tipo         = t.pedidosTipoError;
    if (!form.servicio)        e.servicio     = t.pedidosServicioError;
    if (!form.prioridad)       e.prioridad    = t.pedidosPrioridadError;
    if (!form.estado)          e.estado       = t.pedidosEstadoError;
    if (!form.fecha)           e.fecha        = t.pedidosFechaInicioError;
    if (!form.fechaEntrega)    e.fechaEntrega = t.pedidosFechaEntregaError;
    if (!form.mensaje.trim())  e.mensaje      = t.pedidosMensajeError;
    return e;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setConfirm(true);
  }

  async function doSave() {
    setConfirm(false);
    try {
      const hoy = new Date().toISOString().split("T")[0];
      let pedidoId = editId;

      let comprobanteUrl    = form.comprobante;
      let comprobanteNombre = form.comprobanteNombre;
      if (comprobanteFile) {
        setUploadingComp(true);
        try {
          const result = await uploadComprobante(comprobanteFile);
          comprobanteUrl    = result.url;
          comprobanteNombre = result.nombre;
          showToast(t.pedidosComprobanteOk, "success");
        } catch {
          showToast(t.pedidosComprobanteError, "error");
          setUploadingComp(false);
          return;
        }
        setUploadingComp(false);
        setComprobanteFile(null);
      }
      const saveData = { ...form, tecnologias, comprobante: comprobanteUrl, comprobanteNombre };

      if (editId) {
        await updatePedido(editId, saveData);
        showToast(t.pedidosActualizadoOk, "success");
        setEditId(null);
      } else {
        const ref = await addPedido(saveData);
        pedidoId = ref.id;
        showToast(t.pedidosGuardadoOk, "success");
      }

      if (saveData.estado === "cancelado" && pedidoId) {
        await syncPedidoCancelado(pedidoId, {
          cliente: saveData.cliente, clienteId: saveData.clienteId,
          proyecto: saveData.proyecto, tipo: saveData.tipo, servicio: saveData.servicio,
          fechaInicio: saveData.fecha, fechaCancelacion: hoy, tecnologias, motivo: "",
        });
        await removeProyectoConcluido(pedidoId);
      } else if (saveData.estado === "entregado" && pedidoId) {
        await syncPedidoConcluido(pedidoId, {
          cliente: saveData.cliente, clienteId: saveData.clienteId,
          proyecto: saveData.proyecto, tipo: saveData.tipo, servicio: saveData.servicio,
          fechaInicio: saveData.fecha, fechaEntrega: saveData.fechaEntrega,
          tecnologias, mensajeFinal: "",
        });
        await removeProyectoCancelado(pedidoId);
      } else if (pedidoId) {
        await removeProyectoCancelado(pedidoId);
        await removeProyectoConcluido(pedidoId);
      }

      setForm(EMPTY_FORM);
      setTecnologias([]);
      setErrors({});
      const data = await getPedidos();
      setPedidos(data);
    } catch (err) {
      console.error("Error al guardar pedido:", err);
      showToast(t.pedidosGuardadoError, "error");
    }
  }

  function editarPedido(p: Record<string, unknown>) {
    setEditId(p.id as string);
    setForm({
      clienteId:         String(p.clienteId          ?? ""),
      cliente:           String(p.cliente            ?? ""),
      proyecto:          String(p.proyecto           ?? ""),
      tipo:              String(p.tipo               ?? ""),
      servicio:          String(p.servicio           ?? ""),
      prioridad:         String(p.prioridad          ?? ""),
      estado:            String(p.estado             ?? ""),
      fecha:             String(p.fecha              ?? ""),
      fechaEntrega:      String(p.fechaEntrega       ?? ""),
      mensaje:           String(p.mensaje            ?? ""),
      contrato:          String(p.contrato           ?? ""),
      tipoPago:          String(p.tipoPago           ?? ""),
      valorPago:         String(p.valorPago          ?? ""),
      montoTotal:        String(p.montoTotal         ?? ""),
      montoPagado:       String(p.montoPagado        ?? ""),
      comprobante:       String(p.comprobante        ?? ""),
      comprobanteNombre: String(p.comprobanteNombre  ?? ""),
    });
    setTecnologias((p.tecnologias as string[]) ?? []);
    setComprobanteFile(null);
    setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function doDelete() {
    if (!deletingId) return;
    setConfirmDel(false);
    try {
      await deletePedido(deletingId);
      setPedidos(prev => prev.filter(p => p.id !== deletingId));
      showToast("Pedido eliminado", "success");
    } catch {
      showToast(t.pedidosGuardadoError, "error");
    } finally {
      setDeletingId(null);
    }
  }

  function cancelarEdicion() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setTecnologias([]);
    setErrors({});
  }

  const filtered = pedidos.filter(p =>
    String(p.proyecto ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(p.cliente  ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(p.servicio ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const isEditing = editId !== null;

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.pedidosTitle}</h2>
          <p className="panel-subtitle">
            {isEditing ? t.pedidosSubtitleEditar : t.pedidosSubtitleNuevo}
          </p>
        </div>
        {isEditing && (
          <button className="pedido-cancel-edit-btn" onClick={cancelarEdicion}>
            <X size={14} strokeWidth={2} /> {t.pedidosCancelarEdicion}
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirm}
        title={isEditing ? t.pedidosConfirmTitleEditar : t.pedidosConfirmTitleNuevo}
        message={isEditing ? t.pedidosConfirmMsgEditar : t.pedidosConfirmMsgNuevo}
        confirmLabel={t.pedidosConfirmBtn}
        onConfirm={doSave}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal
        open={confirmDel}
        title="Eliminar pedido"
        message="¿Seguro que quieres eliminar este pedido? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={doDelete}
        onCancel={() => { setConfirmDel(false); setDeletingId(null); }}
      />

      <div ref={formRef} className={`form-card${isEditing ? " form-card-editing" : ""}`}>
        <form onSubmit={handleSubmit} noValidate>

          <p className="form-section-label">{t.pedidosDatos}</p>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">{t.pedidosCliente}</label>
              <CustomSelect
                icon={<User size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.clienteId}
                placeholder={t.pedidosSelCliente}
                options={clienteOpts}
                onChange={v => {
                  const nombre = clienteOpts.find(o => o.value === v)?.label ?? "";
                  setForm(f => ({ ...f, clienteId: v, cliente: nombre }));
                  clearField("cliente");
                }}
                searchable
              />
              {errors.cliente && <p className="form-error-msg">{errors.cliente}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosNombreProyecto}</label>
              <div className="form-icon-wrap">
                <FolderOpen size={14} className="form-icon" strokeWidth={1.8} />
                <input
                  type="text"
                  className={`form-input has-icon${errors.proyecto ? " form-input-error" : ""}`}
                  placeholder={t.pedidosEjProyecto}
                  value={form.proyecto}
                  onChange={e => { setForm(f => ({ ...f, proyecto: e.target.value })); clearField("proyecto"); }}
                />
              </div>
              {errors.proyecto && <p className="form-error-msg">{errors.proyecto}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosTipoProyecto}</label>
              <CustomSelect
                icon={<Monitor size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.tipo}
                placeholder={t.pedidosSelTipo}
                options={TIPOS_PROYECTO}
                onChange={v => { setForm(f => ({ ...f, tipo: v })); clearField("tipo"); }}
              />
              {errors.tipo && <p className="form-error-msg">{errors.tipo}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosTipoServicio}</label>
              <CustomSelect
                icon={<Layers size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.servicio}
                placeholder={t.pedidosSelServicio}
                options={SERVICIOS}
                onChange={v => { setForm(f => ({ ...f, servicio: v })); clearField("servicio"); }}
                searchable
              />
              {errors.servicio && <p className="form-error-msg">{errors.servicio}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosPrioridad}</label>
              <CustomSelect
                icon={<Zap size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.prioridad}
                placeholder={t.pedidosSelPrioridad}
                options={PRIORIDADES}
                onChange={v => { setForm(f => ({ ...f, prioridad: v })); clearField("prioridad"); }}
              />
              {errors.prioridad && <p className="form-error-msg">{errors.prioridad}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosEstadoLabel}</label>
              <CustomSelect
                icon={<Activity size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.estado}
                placeholder={t.pedidosSelEstado}
                options={ESTADOS}
                onChange={v => { setForm(f => ({ ...f, estado: v })); clearField("estado"); }}
              />
              {errors.estado && <p className="form-error-msg">{errors.estado}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosFechaInicio}</label>
              <DatePicker
                icon={<CalendarCheck size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.fecha}
                placeholder={t.pedidosSelFechaInicio}
                onChange={v => { setForm(f => ({ ...f, fecha: v })); clearField("fecha"); }}
              />
              {errors.fecha && <p className="form-error-msg">{errors.fecha}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.pedidosFechaEntrega}</label>
              <DatePicker
                icon={<CalendarClock size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.fechaEntrega}
                placeholder={t.pedidosSelFechaEntrega}
                onChange={v => { setForm(f => ({ ...f, fechaEntrega: v })); clearField("fechaEntrega"); }}
              />
              {errors.fechaEntrega && <p className="form-error-msg">{errors.fechaEntrega}</p>}
            </div>

          </div>

          {(form.tipo || form.servicio || form.prioridad || form.estado) && (
            <div className="pedido-tipo-badges">
              {form.tipo === "web"     && <div className="pedido-tipo-badge badge-web"><Globe size={14} strokeWidth={1.8} /><span>{t.badgeWeb}</span></div>}
              {form.tipo === "app"     && <div className="pedido-tipo-badge badge-app"><Smartphone size={14} strokeWidth={1.8} /><span>{t.badgeApp}</span></div>}
              {form.tipo === "desktop" && <div className="pedido-tipo-badge badge-desktop"><Monitor size={14} strokeWidth={1.8} /><span>{t.badgeDesktop}</span></div>}
              {form.servicio  && <div className="pedido-tipo-badge badge-servicio"><Layers size={14} strokeWidth={1.8} /><span>{SERVICIOS_LABEL[form.servicio]}</span></div>}
              {form.prioridad && <div className={`pedido-tipo-badge ${PRIORIDAD_COLORS[form.prioridad]}`}><Zap size={14} strokeWidth={1.8} /><span>{PRIORIDADES.find(p => p.value === form.prioridad)?.label}</span></div>}
              {form.estado    && <div className={`pedido-tipo-badge ${ESTADO_COLORS[form.estado]}`}><Activity size={14} strokeWidth={1.8} /><span>{ESTADOS.find(s => s.value === form.estado)?.label}</span></div>}
            </div>
          )}

          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.pedidosPlataformas}</p>
          <div className="form-field">
            <label className="form-label">{t.pedidosSelTecnologias}</label>
            <div className="tech-chips">
              {TECNOLOGIAS.map(tv => (
                <button
                  key={tv}
                  type="button"
                  className={`tech-chip${tecnologias.includes(tv) ? " tech-chip-active" : ""}`}
                  onClick={() => toggleTech(tv)}
                >
                  <Code2 size={12} strokeWidth={2} />
                  {tv}
                </button>
              ))}
            </div>
          </div>

          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.pedidosMensajeInicio}</p>
          <div className="form-field">
            <label className="form-label">{t.pedidosMensajeLabel}</label>
            <div className="form-textarea-wrap">
              <MessageSquare size={14} className="form-textarea-icon" strokeWidth={1.8} />
              <textarea
                value={form.mensaje}
                onChange={e => { setForm(f => ({ ...f, mensaje: e.target.value })); clearField("mensaje"); }}
                className={`form-textarea${errors.mensaje ? " form-input-error" : ""}`}
                placeholder={t.pedidosMensajePH}
                rows={5}
              />
            </div>
            {errors.mensaje && <p className="form-error-msg">{errors.mensaje}</p>}
          </div>

          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.pedidosPagoInfo}</p>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">{t.clientesDuracion}</label>
              <CustomSelect
                icon={<FileText size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.contrato}
                placeholder={t.clientesSelDuracion}
                options={[
                  { value: "sin-contrato", label: t.clientesSinContrato },
                  ...Array.from({ length: 24 }, (_, i) => i + 1).map(m => ({
                    value: String(m),
                    label: m === 1 ? `1 ${t.clientesMes}` : `${m} ${t.clientesMeses}`,
                  })),
                ]}
                onChange={v => setForm(f => ({ ...f, contrato: v }))}
              />
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesTipoPago}</label>
              <CustomSelect
                icon={<Wallet size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.tipoPago}
                placeholder={t.clientesSelTipoPago}
                options={[
                  { value: "mensual", label: t.clientesPagoMensual },
                  { value: "unico",   label: t.clientesPagoUnico   },
                ]}
                onChange={v => setForm(f => ({ ...f, tipoPago: v }))}
              />
            </div>

            {form.tipoPago && (
              <div className="form-field">
                <label className="form-label">
                  {form.tipoPago === "mensual" ? t.clientesValorMensual : t.clientesValorTotal}
                </label>
                <div className="form-icon-wrap">
                  <DollarSign size={14} className="form-icon" strokeWidth={1.8} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input has-icon"
                    placeholder={form.tipoPago === "mensual" ? t.clientesEjValorMensual : t.clientesEjValorTotal}
                    value={form.valorPago}
                    onChange={e => setForm(f => ({ ...f, valorPago: e.target.value }))}
                  />
                </div>
              </div>
            )}


            {form.tipoPago && (
              <div className="form-field">
                <label className="form-label">
                  {form.tipoPago === "mensual" ? t.clientesValorMensual : t.clientesValorTotal}
                </label>
                <div className="form-icon-wrap">
                  <DollarSign size={14} className="form-icon" strokeWidth={1.8} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input has-icon"
                    placeholder={form.tipoPago === "mensual" ? t.clientesEjValorMensual : t.clientesEjValorTotal}
                    value={form.montoTotal}
                    onChange={e => setForm(f => ({ ...f, montoTotal: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {form.tipoPago && (
              <div className="form-field">
                <label className="form-label">{t.pedidosMontoPagado}</label>
                <div className="form-icon-wrap">
                  <DollarSign size={14} className="form-icon" strokeWidth={1.8} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input has-icon"
                    placeholder={t.pedidosMontoPagadoPH}
                    value={form.montoPagado}
                    onChange={e => setForm(f => ({ ...f, montoPagado: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {form.tipoPago && (
              <div className="form-field">
                <label className="form-label" style={{ color: (parseFloat(form.montoTotal)||0) - (parseFloat(form.montoPagado)||0) > 0 ? "#dc2626" : "#059669" }}>
                  {t.pedidosMontoPendiente}
                </label>
                <div className="form-icon-wrap">
                  <DollarSign size={14} className="form-icon" strokeWidth={1.8} />
                  <input
                    type="text"
                    readOnly
                    className="form-input has-icon"
                    style={{
                      cursor: "default",
                      fontWeight: 600,
                      background: (parseFloat(form.montoTotal)||0) - (parseFloat(form.montoPagado)||0) > 0 ? "#fef2f2" : "#f0fdf4",
                      color:      (parseFloat(form.montoTotal)||0) - (parseFloat(form.montoPagado)||0) > 0 ? "#dc2626" : "#059669",
                    }}
                    value={`$${Math.max(0, (parseFloat(form.montoTotal)||0) - (parseFloat(form.montoPagado)||0)).toFixed(2)}`}
                  />
                </div>
              </div>
            )}

          </div>

          <div className="form-field" style={{ marginTop: "1rem" }}>
            <label className="form-label">{t.pedidosSubirComprobante}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {form.comprobante && !comprobanteFile && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "#6c63ff" }}>
                  <FileCheck size={14} strokeWidth={2} />
                  <span>{t.pedidosComprobanteActual}:</span>
                  <a href={form.comprobante} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#6c63ff", textDecoration: "underline" }}>
                    {t.pedidosVerComprobante} <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {comprobanteFile && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "#059669" }}>
                  <FileCheck size={14} strokeWidth={2} />
                  <span>{comprobanteFile.name}</span>
                  <button type="button" onClick={() => setComprobanteFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                    <X size={13} />
                  </button>
                </div>
              )}
              <input
                ref={comprobanteInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setComprobanteFile(f); e.target.value = ""; }}
              />
              <button
                type="button"
                className="form-btn-cancel"
                style={{ width: "fit-content" }}
                onClick={() => comprobanteInputRef.current?.click()}
                disabled={uploadingComp}
              >
                {uploadingComp
                  ? <><Loader2 size={14} className="panel-loading-spin" /> {t.pedidosComprobanteSubiendo}</>
                  : <><Upload size={14} strokeWidth={2} /> {t.pedidosSubirComprobante}</>
                }
              </button>
            </div>
          </div>

          <div className="form-actions">
            {isEditing && (
              <button type="button" className="form-btn-cancel" onClick={cancelarEdicion}>
                <X size={15} strokeWidth={2} /> {t.pedidosCancelar}
              </button>
            )}
            <button type="submit" className="form-btn-submit" disabled={uploadingComp}>
              <Save size={15} strokeWidth={2} />
              {isEditing ? t.pedidosGuardarCambios : t.pedidosGuardar}
            </button>
          </div>

        </form>
      </div>

      <div className="panel-header" style={{ marginTop: "2rem" }}>
        <div>
          <h2 className="panel-title" style={{ fontSize: "1rem" }}>{t.pedidosRegistrados}</h2>
          <p className="panel-subtitle">
            {loadingData
              ? t.pedidosCargando
              : `${filtered.length} ${filtered.length !== 1 ? t.pedidosPlural : t.pedidosSingular}`}
          </p>
        </div>
        <div className="table-search-wrap">
          <Search size={14} className="table-search-icon" strokeWidth={1.8} />
          <input
            className="table-search-input"
            placeholder={t.pedidosBuscar}
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
              <th>{t.pedidosServicio}</th>
              <th>{t.pedidosPrioridad}</th>
              <th>{t.dashEstado}</th>
              <th>{t.clientesInicio}</th>
              <th>{t.pedidosEntrega}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loadingData ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                  <Loader2 size={20} className="panel-loading-spin" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem" }}>{t.pedidosSinResultados}</td></tr>
            ) : paginated.map(p => (
              <tr key={String(p.id)} className={editId === String(p.id) ? "tr-editing" : ""}>
                <td className="reporte-td-bold">{String(p.proyecto ?? "—")}</td>
                <td>{String(p.cliente ?? "—")}</td>
                <td className="reporte-td-gray">{SERVICIOS_LABEL[String(p.servicio ?? "")] ?? String(p.servicio ?? "—")}</td>
                <td>
                  <span className={`pedido-tipo-badge ${PRIORIDAD_COLORS[String(p.prioridad)] ?? ""}`} style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem", textTransform: "capitalize" }}>
                    {PRIORIDADES.find(pr => pr.value === String(p.prioridad))?.label ?? String(p.prioridad ?? "")}
                  </span>
                </td>
                <td>
                  <span className={`pedido-tipo-badge ${ESTADO_COLORS[String(p.estado)] ?? ""}`} style={{ padding: "0.2rem 0.65rem", fontSize: "0.73rem" }}>
                    {ESTADOS.find(e => e.value === String(p.estado))?.label ?? String(p.estado)}
                  </span>
                </td>
                <td className="reporte-td-gray">{p.fecha        ? formatFecha(String(p.fecha), locale)        : "—"}</td>
                <td className="reporte-td-gray">{p.fechaEntrega  ? formatFecha(String(p.fechaEntrega), locale) : "—"}</td>
                <td>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    <button
                      className="table-edit-btn"
                      onClick={() => editarPedido(p)}
                      title={t.pedidosSubtitleEditar}
                    >
                      <Pencil size={13} strokeWidth={2} />
                    </button>
                    <button
                      className="cv-delete-btn"
                      onClick={() => { setDeletingId(String(p.id)); setConfirmDel(true); }}
                      title="Eliminar pedido"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-pagination-wrap">
          <Pagination total={filtered.length} perPage={PER_PAGE} current={page} onChange={setPage} />
        </div>
      </div>
    </>
  );
}
