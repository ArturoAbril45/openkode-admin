"use client";

import { useState, useRef, useEffect } from "react";
import { Send, PanelLeftClose, PanelLeftOpen, Search, Loader2 } from "lucide-react";
import { getClientes, getMensajes, addMensaje } from "../../lib/services";
import { useLang } from "../../lib/LangContext";
import { avatarColor } from "../../lib/avatarColor";

type Mensaje = { id?: string; de: string; texto: string; hora: string };
type Cliente = Record<string, unknown>;

function horaActual() {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function MensajesPage() {
  const { t } = useLang();
  const [clientes,       setClientes]       = useState<Cliente[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [seleccionado,   setSeleccionado]   = useState<Cliente | null>(null);
  const [chats,          setChats]          = useState<Record<string, Mensaje[]>>({});
  const [loadingChat,    setLoadingChat]    = useState(false);
  const [texto,          setTexto]          = useState("");
  const [enviando,       setEnviando]       = useState(false);
  const [buscar,         setBuscar]         = useState("");
  const [chatCollapsed,  setChatCollapsed]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getClientes().then(data => {
      setClientes(data);
      if (data.length > 0) setSeleccionado(data[0]);
      setLoadingClients(false);
    });
  }, []);

  useEffect(() => {
    if (!seleccionado) return;
    const id = seleccionado.id as string;
    if (chats[id]) return;
    setLoadingChat(true);
    getMensajes(id).then(msgs => {
      const parsed = msgs.map((m: Record<string, unknown>) => ({
        id:    m.id as string,
        de:    m.de as string,
        texto: m.texto as string,
        hora:  m.hora as string ?? "—",
      }));
      setChats(prev => ({ ...prev, [id]: parsed }));
      setLoadingChat(false);
    });
  }, [seleccionado]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [seleccionado, chats]);

  async function enviar() {
    if (!texto.trim() || !seleccionado || enviando) return;
    const id    = seleccionado.id as string;
    const hora  = horaActual();
    const nuevo: Mensaje = { de: "admin", texto: texto.trim(), hora };
    setChats(prev => ({ ...prev, [id]: [...(prev[id] || []), nuevo] }));
    setTexto("");
    setEnviando(true);
    try {
      await addMensaje(id, { de: "admin", texto: nuevo.texto, hora });
    } finally {
      setEnviando(false);
    }
  }

  const filtrados = clientes.filter(c =>
    String(c.nombre ?? "").toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="chat-root">

      <aside className={`chat-sidebar${chatCollapsed ? " chat-sidebar-collapsed" : ""}`}>
        <div className="chat-sidebar-header">
          {!chatCollapsed && <p className="chat-sidebar-title">{t.mensajesTitle}</p>}
          <button
            className="chat-collapse-btn"
            onClick={() => setChatCollapsed(!chatCollapsed)}
            title={chatCollapsed ? t.mensajesExpandir : t.mensajesColapsar}
          >
            {chatCollapsed ? <PanelLeftOpen size={16} strokeWidth={1.8} /> : <PanelLeftClose size={16} strokeWidth={1.8} />}
          </button>
        </div>

        {!chatCollapsed && (
          <div className="chat-search-wrap">
            <Search size={13} className="chat-search-icon" strokeWidth={1.8} />
            <input
              className="chat-search-input"
              placeholder={t.mensajesBuscar}
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
            />
          </div>
        )}

        <div className="chat-list">
          {loadingClients ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Loader2 size={20} className="panel-loading-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.8rem", textAlign: "center" }}>
              {buscar ? t.mensajesSinResultados : t.mensajesNoHay}
            </p>
          ) : filtrados.map(c => {
            const id     = c.id as string;
            const nombre = String(c.nombre ?? "?");
            const msgs   = chats[id] || [];
            const ultimo = msgs[msgs.length - 1];
            const activo = seleccionado?.id === id;
            const color  = avatarColor(nombre);
            return (
              <div
                key={id}
                className={`chat-item${activo ? " chat-item-active" : ""}${chatCollapsed ? " chat-item-icon-only" : ""}`}
                onClick={() => setSeleccionado(c)}
                title={chatCollapsed ? nombre : undefined}
              >
                <div className="chat-avatar" style={{ background: color }}>{nombre.charAt(0)}</div>
                {!chatCollapsed && (
                  <>
                    <div className="chat-item-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <p className="chat-item-name">{nombre}</p>
                        {!!c.pais && <span className="chat-pais-tag">{String(c.pais)}</span>}
                      </div>
                      <p className="chat-item-preview">{ultimo?.texto ?? t.mensajesSinMensajes}</p>
                    </div>
                    {ultimo && <span className="chat-item-hora">{ultimo.hora}</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <div className="chat-main">

        {!seleccionado ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
            {t.mensajesSelecciona}
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-avatar" style={{ background: avatarColor(String(seleccionado.nombre ?? "")), width: 32, height: 32, fontSize: "0.78rem" }}>
                {String(seleccionado.nombre ?? "?").charAt(0)}
              </div>
              <div>
                <p className="chat-header-name">{String(seleccionado.nombre ?? "")}</p>
                <p className="chat-header-proyecto">
                  {seleccionado.proyecto ? String(seleccionado.proyecto) : ""}
                  {seleccionado.pais ? ` · ${String(seleccionado.pais)}` : ""}
                  {seleccionado.telefono ? ` · ${String(seleccionado.telefono)}` : ""}
                </p>
              </div>
            </div>

            <div className="chat-messages">
              {loadingChat ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                  <Loader2 size={22} className="panel-loading-spin" />
                </div>
              ) : (chats[seleccionado.id as string] || []).length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.83rem", marginTop: "2rem" }}>
                  {t.mensajesVacio}
                </div>
              ) : (
                (chats[seleccionado.id as string] || []).map((m, i, arr) => {
                  const cambio = i === 0 || arr[i - 1].de !== m.de;
                  return (
                    <div key={m.id ?? i} className={`chat-bubble-wrap${m.de === "admin" ? " admin" : ""}${cambio ? " chat-bubble-gap" : ""}`}>
                      <div className={`chat-bubble${m.de === "admin" ? " chat-bubble-admin" : " chat-bubble-cliente"}`}>
                        <p>{m.texto}</p>
                        <span className="chat-hora">{m.hora}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-bar">
              <input
                className="chat-input"
                placeholder={t.mensajesEscribe}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={e => e.key === "Enter" && enviar()}
                disabled={enviando}
              />
              <button className="chat-send-btn" onClick={enviar} disabled={enviando || !texto.trim()}>
                {enviando
                  ? <Loader2 size={16} className="panel-loading-spin" />
                  : <Send size={16} strokeWidth={2} />}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
