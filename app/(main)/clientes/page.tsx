"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, CreditCard, Mail, Phone, Globe,
  CalendarClock, CalendarCheck, FileText, KeyRound, Eye, EyeOff, Save, Wallet, DollarSign, MapPin, Search, Trash2, Pencil, X,
} from "lucide-react";
import CustomSelect      from "../../components/CustomSelect";
import DatePicker        from "../../components/DatePicker";
import ConfirmModal      from "../../components/ConfirmModal";
import PasswordStrength  from "../../components/PasswordStrength";
import Pagination        from "../../components/Pagination";
import { showToast }     from "../../components/Toast";
import { getClientes, addCliente, updateCliente, deleteCliente } from "../../lib/services";
import { useLang } from "../../lib/LangContext";

const MESES = Array.from({ length: 24 }, (_, i) => i + 1);

const PAISES = [
  "Afganistán","Albania","Alemania","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaiyán","Bahamas","Bangladés","Bélgica","Belice","Benín","Bolivia",
  "Bosnia y Herzegovina","Brasil","Bulgaria","Burkina Faso","Burundi","Bután","Cabo Verde",
  "Camboya","Camerún","Canadá","Chad","Chile","China","Chipre","Colombia","Comoras",
  "Congo","Corea del Norte","Corea del Sur","Costa Rica","Costa de Marfil","Croacia","Cuba",
  "Dinamarca","Dominica","Ecuador","Egipto","El Salvador","Emiratos Árabes Unidos","Eritrea",
  "Eslovaquia","Eslovenia","España","Estados Unidos","Estonia","Etiopía","Fiji","Filipinas",
  "Finlandia","Francia","Gabón","Ghana","Georgia","Granada","Grecia","Guatemala","Guinea",
  "Guinea-Bisáu","Guinea Ecuatorial","Guyana","Haití","Honduras","Hungría","India",
  "Indonesia","Irak","Irán","Irlanda","Islandia","Israel","Italia","Jamaica","Japón",
  "Jordania","Kazajistán","Kenia","Kirguistán","Kiribati","Kuwait","Laos","Lesoto","Letonia",
  "Líbano","Liberia","Libia","Liechtenstein","Lituania","Luxemburgo","Madagascar","Malasia",
  "Malaui","Maldivas","Malí","Malta","Marruecos","Mauricio","Mauritania","México",
  "Micronesia","Moldavia","Mónaco","Mongolia","Montenegro","Mozambique","Namibia","Nepal",
  "Nicaragua","Níger","Nigeria","Noruega","Nueva Zelanda","Omán","Países Bajos","Pakistán",
  "Palaos","Palestina","Panamá","Papúa Nueva Guinea","Paraguay","Perú","Polonia","Portugal",
  "Qatar","Reino Unido","República Centroafricana","República Checa","República Dominicana",
  "Ruanda","Rumania","Rusia","Samoa","San Cristóbal y Nieves","San Marino","Santa Lucía",
  "Santo Tomé y Príncipe","San Vicente y las Granadinas","Senegal","Serbia","Seychelles",
  "Sierra Leona","Singapur","Siria","Somalia","Sri Lanka","Sudáfrica","Sudán","Sudán del Sur",
  "Suecia","Suiza","Surinam","Tailandia","Tanzania","Timor Oriental","Togo","Tonga",
  "Trinidad y Tobago","Túnez","Turkmenistán","Turquía","Tuvalu","Ucrania","Uganda","Uruguay",
  "Uzbekistán","Vanuatu","Venezuela","Vietnam","Yemen","Yibuti","Zambia","Zimbabue",
];

function formatFecha(iso: string, locale: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

const PER_PAGE = 5;

import { avatarColor } from "../../lib/avatarColor";

export default function ClientesPage() {
  const { t, lang } = useLang();
  const locale = lang === "EN" ? "en" : "es";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [confirm, setConfirm]           = useState(false);
  const [errors,  setErrors]            = useState<Record<string, string>>({});
  const [search,  setSearch]            = useState("");
  const [page,    setPage]              = useState(1);
  const [clientes,    setClientes]    = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getClientes().then(data => { setClientes(data); setLoadingData(false); });
  }, []);

  const [form, setForm] = useState({
    nombre:        "",
    dni:           "",
    correo:        "",
    telefono:      "",
    pais:          "",
    proyecto:      "",
    fechaInicio:   "",
    fechaMaxima:   "",
    contrato:      "",
    tipoPago:      "",
    valorPago:     "",
    password:      "",
    confirmar:     "",
  });

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => { const n = { ...er }; delete n[name]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nombre)    e.nombre    = t.clientesCampoObligatorio;
    if (!form.dni)       e.dni       = t.clientesCampoObligatorio;
    if (!form.correo)    e.correo    = t.clientesCampoObligatorio;
    if (!form.telefono)  e.telefono  = t.clientesCampoObligatorio;
    if (!form.pais)      e.pais      = t.clientesSelPaisError;
    if (!form.proyecto)  e.proyecto  = t.clientesCampoObligatorio;
    if (!form.fechaInicio) e.fechaInicio = t.clientesSelFechaError;
    if (!form.fechaMaxima) e.fechaMaxima = t.clientesSelFechaError;
    if (!form.contrato)  e.contrato  = t.clientesSelDuracionError;
    if (!form.tipoPago)  e.tipoPago  = t.clientesSelPagoError;
    if (!editId && !form.password) e.password = t.clientesCrearPasswordError;
    if (form.password && form.confirmar !== form.password) e.confirmar = t.clientesPasswordNoCoinciden;
    return e;
  }

  function editarCliente(c: Record<string, unknown>) {
    setEditId(c.id as string);
    setForm({
      nombre:      String(c.nombre      ?? ""),
      dni:         String(c.dni         ?? ""),
      correo:      String(c.correo      ?? ""),
      telefono:    String(c.telefono    ?? ""),
      pais:        String(c.pais        ?? ""),
      proyecto:    String(c.proyecto    ?? ""),
      fechaInicio: String(c.fechaInicio ?? ""),
      fechaMaxima: String(c.fechaMaxima ?? ""),
      contrato:    String(c.contrato    ?? ""),
      tipoPago:    String(c.tipoPago    ?? ""),
      valorPago:   String(c.valorPago   ?? ""),
      password:    "",
      confirmar:   "",
    });
    setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function cancelarEdicion() {
    setEditId(null);
    setForm({ nombre:"", dni:"", correo:"", telefono:"", pais:"", proyecto:"", fechaInicio:"", fechaMaxima:"", contrato:"", tipoPago:"", valorPago:"", password:"", confirmar:"" });
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setConfirm(true);
  }

  async function doDelete() {
    if (!deletingId) return;
    setConfirmDel(false);
    try {
      await deleteCliente(deletingId);
      setClientes(prev => prev.filter(c => c.id !== deletingId));
      showToast("Cliente eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function doSave() {
    setConfirm(false);
    try {
      if (editId) {
        const datos: Record<string, unknown> = { nombre: form.nombre, dni: form.dni, correo: form.correo, telefono: form.telefono, pais: form.pais, proyecto: form.proyecto, fechaInicio: form.fechaInicio, fechaMaxima: form.fechaMaxima, contrato: form.contrato, tipoPago: form.tipoPago, valorPago: form.valorPago };
        if (form.password) datos.password = form.password;
        await updateCliente(editId, datos);
        setEditId(null);
        showToast(t.clientesGuardadoOk, "success");
      } else {
        await addCliente({ ...form });
        showToast(t.clientesGuardadoOk, "success");
      }
      setForm({ nombre:"", dni:"", correo:"", telefono:"", pais:"", proyecto:"", fechaInicio:"", fechaMaxima:"", contrato:"", tipoPago:"", valorPago:"", password:"", confirmar:"" });
      setErrors({});
      const data = await getClientes();
      setClientes(data);
    } catch {
      showToast(t.clientesGuardadoError, "error");
    }
  }

  const filtered = clientes.filter((c: Record<string, unknown>) =>
    String(c.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(c.correo ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(c.pais   ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(c.proyecto ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.clientesTitle}</h2>
          <p className="panel-subtitle">{editId ? t.pedidosSubtitleEditar : t.clientesSubtitle}</p>
        </div>
        {editId && (
          <button className="pedido-cancel-edit-btn" onClick={cancelarEdicion}>
            <X size={14} strokeWidth={2} /> {t.pedidosCancelarEdicion}
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirm}
        title={t.clientesConfirmTitle}
        message={t.clientesConfirmMsg}
        confirmLabel={t.clientesConfirmBtn}
        onConfirm={doSave}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal
        open={confirmDel}
        title="Eliminar cliente"
        message="¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={doDelete}
        onCancel={() => { setConfirmDel(false); setDeletingId(null); }}
      />

      <div ref={formRef} className={`form-card${editId ? " form-card-editing" : ""}`}>
        <form onSubmit={handleSubmit} noValidate>

          <p className="form-section-label">{t.clientesDatosPersonales}</p>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">{t.clientesNombreCompleto}</label>
              <div className="form-icon-wrap">
                <User size={14} className="form-icon" strokeWidth={1.8} />
                <input name="nombre" value={form.nombre} onChange={handle}
                  className={`form-input has-icon${errors.nombre ? " form-input-error" : ""}`} placeholder={t.clientesEjNombre} />
              </div>
              {errors.nombre && <p className="form-error-msg">{errors.nombre}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesDni}</label>
              <div className="form-icon-wrap">
                <CreditCard size={14} className="form-icon" strokeWidth={1.8} />
                <input name="dni" value={form.dni} onChange={handle}
                  className={`form-input has-icon${errors.dni ? " form-input-error" : ""}`} placeholder={t.clientesEjDni} />
              </div>
              {errors.dni && <p className="form-error-msg">{errors.dni}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesCorreo}</label>
              <div className="form-icon-wrap">
                <Mail size={14} className="form-icon" strokeWidth={1.8} />
                <input name="correo" type="email" value={form.correo} onChange={handle}
                  className={`form-input has-icon${errors.correo ? " form-input-error" : ""}`} placeholder="correo@ejemplo.com" />
              </div>
              {errors.correo && <p className="form-error-msg">{errors.correo}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesTelefono}</label>
              <div className="form-icon-wrap">
                <Phone size={14} className="form-icon" strokeWidth={1.8} />
                <input name="telefono" type="tel" value={form.telefono} onChange={handle}
                  className={`form-input has-icon${errors.telefono ? " form-input-error" : ""}`} placeholder={t.clientesEjTelefono} />
              </div>
              {errors.telefono && <p className="form-error-msg">{errors.telefono}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesPais}</label>
              <CustomSelect
                icon={<MapPin size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.pais}
                placeholder={t.clientesSelPais}
                options={PAISES.map(p => ({ value: p, label: p }))}
                onChange={v => { setForm(f => ({ ...f, pais: v })); setErrors(er => { const n={...er}; delete n.pais; return n; }); }}
                searchable
              />
              {errors.pais && <p className="form-error-msg">{errors.pais}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesAppWeb}</label>
              <div className="form-icon-wrap">
                <Globe size={14} className="form-icon" strokeWidth={1.8} />
                <input name="proyecto" value={form.proyecto} onChange={handle}
                  className={`form-input has-icon${errors.proyecto ? " form-input-error" : ""}`} placeholder={t.clientesEjAppWeb} />
              </div>
              {errors.proyecto && <p className="form-error-msg">{errors.proyecto}</p>}
            </div>

          </div>

          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.clientesFechasContrato}</p>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">{t.clientesFechaInicio}</label>
              <DatePicker
                icon={<CalendarCheck size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.fechaInicio}
                placeholder={t.clientesSelFechaInicio}
                onChange={v => { setForm(f => ({ ...f, fechaInicio: v })); setErrors(er => { const n={...er}; delete n.fechaInicio; return n; }); }}
              />
              {errors.fechaInicio && <p className="form-error-msg">{errors.fechaInicio}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesFechaMaxima}</label>
              <DatePicker
                icon={<CalendarClock size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.fechaMaxima}
                placeholder={t.clientesSelFechaMaxima}
                onChange={v => { setForm(f => ({ ...f, fechaMaxima: v })); setErrors(er => { const n={...er}; delete n.fechaMaxima; return n; }); }}
              />
              {errors.fechaMaxima && <p className="form-error-msg">{errors.fechaMaxima}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesDuracion}</label>
              <CustomSelect
                icon={<FileText size={14} className="form-icon" strokeWidth={1.8} />}
                value={form.contrato}
                placeholder={t.clientesSelDuracion}
                options={MESES.map(m => ({ value: String(m), label: m === 1 ? `1 ${t.clientesMes}` : `${m} ${t.clientesMeses}` }))}
                onChange={v => { setForm(f => ({ ...f, contrato: v })); setErrors(er => { const n={...er}; delete n.contrato; return n; }); }}
              />
              {errors.contrato && <p className="form-error-msg">{errors.contrato}</p>}
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
                onChange={v => { setForm(f => ({ ...f, tipoPago: v })); setErrors(er => { const n={...er}; delete n.tipoPago; return n; }); }}
              />
              {errors.tipoPago && <p className="form-error-msg">{errors.tipoPago}</p>}
            </div>

            {form.tipoPago && (
              <div className="form-field">
                <label className="form-label">
                  {form.tipoPago === "mensual" ? t.clientesValorMensual : t.clientesValorTotal}
                </label>
                <div className="form-icon-wrap">
                  <DollarSign size={14} className="form-icon" strokeWidth={1.8} />
                  <input
                    name="valorPago"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valorPago}
                    onChange={handle}
                    className="form-input has-icon"
                    placeholder={form.tipoPago === "mensual" ? t.clientesEjValorMensual : t.clientesEjValorTotal}
                  />
                </div>
              </div>
            )}

          </div>

          <p className="form-section-label" style={{ marginTop: "1.75rem" }}>{t.clientesAcceso}</p>
          <div className="form-grid-half">

            <div className="form-field">
              <label className="form-label">{t.clientesPassword}</label>
              <div className="form-icon-wrap">
                <KeyRound size={14} className="form-icon" strokeWidth={1.8} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handle}
                  className={`form-input has-icon has-icon-right${errors.password ? " form-input-error" : ""}`}
                  placeholder={t.clientesCrearPasswordPH}
                />
                <button type="button" className="form-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <EyeOff size={15} strokeWidth={1.8} />
                    : <Eye    size={15} strokeWidth={1.8} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && <p className="form-error-msg">{errors.password}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">{t.clientesConfirmarPassword}</label>
              <div className="form-icon-wrap">
                <KeyRound size={14} className="form-icon" strokeWidth={1.8} />
                <input
                  name="confirmar"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmar}
                  onChange={handle}
                  className={`form-input has-icon has-icon-right${form.confirmar && form.confirmar !== form.password ? " form-input-error" : ""}`}
                  placeholder={t.clientesRepetirPasswordPH}
                />
                <button type="button" className="form-toggle-pw"
                  onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm
                    ? <EyeOff size={15} strokeWidth={1.8} />
                    : <Eye    size={15} strokeWidth={1.8} />}
                </button>
              </div>
              {form.confirmar && form.confirmar !== form.password && (
                <p className="form-error-msg">{t.clientesPasswordNoCoinciden}</p>
              )}
            </div>

          </div>

          <div className="form-actions">
            {editId && (
              <button type="button" className="form-btn-cancel" onClick={cancelarEdicion}>
                <X size={15} strokeWidth={2} /> {t.pedidosCancelar}
              </button>
            )}
            <button type="submit" className="form-btn-submit">
              <Save size={15} strokeWidth={2} />
              {editId ? t.pedidosGuardarCambios : t.clientesGuardar}
            </button>
          </div>

        </form>
      </div>

      <div className="panel-header" style={{ marginTop: "2rem" }}>
        <div>
          <h2 className="panel-title" style={{ fontSize: "1rem" }}>{t.clientesRegistrados}</h2>
          <p className="panel-subtitle">
            {loadingData
              ? t.clientesCargando
              : `${filtered.length} ${filtered.length !== 1 ? t.clientesPlural : t.clientesSingular}`}
          </p>
        </div>
        <div className="table-search-wrap">
          <Search size={14} className="table-search-icon" strokeWidth={1.8} />
          <input
            className="table-search-input"
            placeholder={t.clientesBuscar}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="reporte-card">
        <table className="reporte-table">
          <thead>
            <tr>
              <th>{t.clientesTitle}</th>
              <th>{t.clientesCorreo}</th>
              <th>{t.clientesTelefono}</th>
              <th>{t.clientesPais}</th>
              <th>{t.dashProyecto}</th>
              <th>{t.clientesContrato}</th>
              <th>{t.clientesValor}</th>
              <th>{t.clientesInicio}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loadingData
              ? <tr><td colSpan={8} style={{ textAlign:"center", color:"#9ca3af", padding:"1.5rem" }}>{t.clientesCargando}</td></tr>
              : paginated.length === 0
              ? <tr><td colSpan={8} style={{ textAlign:"center", color:"#9ca3af", padding:"1.5rem" }}>{t.clientesSinResultados}</td></tr>
              : paginated.map((c: Record<string, unknown>) => (
              <tr key={String(c.id)}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <div className="clientes-avatar" style={{ background: avatarColor(String(c.nombre ?? "")) }}>{String(c.nombre ?? "?").charAt(0)}</div>
                    <span className="reporte-td-bold">{String(c.nombre ?? "")}</span>
                  </div>
                </td>
                <td className="reporte-td-gray">{String(c.correo ?? "")}</td>
                <td className="reporte-td-gray">{String(c.telefono ?? "")}</td>
                <td>{String(c.pais ?? "")}</td>
                <td>{String(c.proyecto ?? "")}</td>
                <td className="reporte-td-gray">{c.contrato} {parseInt(String(c.contrato)) !== 1 ? t.clientesMeses : t.clientesMes}</td>
                <td className="reporte-td-bold" style={{ color:"#16a34a" }}>${c.valorPago} {c.tipoPago === "mensual" ? t.clientesXMes : ""}</td>
                <td className="reporte-td-gray">{c.fechaInicio ? formatFecha(String(c.fechaInicio), locale) : ""}</td>
                <td>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    <button
                      className="table-edit-btn"
                      onClick={() => editarCliente(c)}
                      title={t.pedidosSubtitleEditar}
                    >
                      <Pencil size={13} strokeWidth={2} />
                    </button>
                    <button
                      className="cv-delete-btn"
                      onClick={() => { setDeletingId(String(c.id)); setConfirmDel(true); }}
                      title="Eliminar cliente"
                    >
                      <Trash2 size={14} />
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
