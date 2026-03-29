"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Package,
  MessageSquare, Bell, Settings, FileBarChart2,
  LogOut, ChevronRight, PanelLeftClose, PanelLeftOpen, Search, Globe,
  KeyRound, FolderCheck, FolderX, CalendarClock, CalendarCheck,
  Trash2,
} from "lucide-react";
import PageLoader           from "../components/PageLoader";
import ToastContainer       from "../components/Toast";
import Breadcrumb           from "../components/Breadcrumb";
import ChangePasswordModal  from "../components/ChangePasswordModal";
import { auth }       from "../lib/firebase";
import { signOut }    from "firebase/auth";
import {
  getNotificaciones, addNotificacion,
  marcarTodasLeidas, limpiarNotificaciones,
  getConfiguracion,
} from "../lib/services";
import { LangProvider, useLang } from "../lib/LangContext";

const SECTION_LABELS: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/clientes":             "Clientes",
  "/pedidos":              "Pedidos",
  "/mensajes":             "Mensajes",
  "/proyectos":            "Proyectos Concluidos",
  "/proyectos-cancelados": "Proyectos Cancelados",
  "/fecha-entrega":        "Fecha de Entrega",
  "/fecha-inicio":         "Fecha de Inicio",
  "/alertas":              "Alertas",
  "/configuracion":        "Configuración",
  "/reporte-tecnico":      "Reporte Técnico",
};

type Notif = { id: string; mensaje: string; leida: boolean; creadoEn?: unknown };

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <LayoutContent>{children}</LayoutContent>
    </LangProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const { lang, setLang, t } = useLang();
  const [collapsed, setCollapsed]   = useState(false);
  const [avatarMenu,   setAvatarMenu]   = useState(false);
  const [bellMenu,     setBellMenu]     = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [notifs, setNotifs]         = useState<Notif[]>([]);
  const [perfilFoto, setPerfilFoto] = useState("");
  const [perfilNombre, setPerfilNombre] = useState("A");
  const [loggingOut,   setLoggingOut]   = useState(false);
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("auth") && !localStorage.getItem("auth")) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    getNotificaciones().then(data => setNotifs(data as Notif[]));
  }, []);

  function cargarPerfil() {
    getConfiguracion().then((data: Record<string, unknown> | null) => {
      if (!data) return;
      if (data.foto)   setPerfilFoto(data.foto as string);
      if (data.nombre) setPerfilNombre((data.nombre as string).charAt(0).toUpperCase());
    });
  }
  useEffect(() => {
    cargarPerfil();
    window.addEventListener("configuracion-updated", cargarPerfil);
    return () => window.removeEventListener("configuracion-updated", cargarPerfil);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pathname || pathname === prevPath.current) return;
    const label = SECTION_LABELS[pathname];
    if (!label) { prevPath.current = pathname; return; }
    prevPath.current = pathname;
    addNotificacion({ mensaje: `Admin accedió a ${label}`, seccion: pathname })
      .then(() => getNotificaciones().then(data => setNotifs(data as Notif[])));
  }, [pathname]);

  function tiempoRelativo(ts: unknown): string {
    if (!ts) return "";
    let date: Date;
    try { date = (ts as { toDate(): Date }).toDate(); }
    catch { return ""; }
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return t.timeNow;
    if (mins < 60) return t.timeMinAgo(mins);
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return t.timeHAgo(hrs);
    return t.timeDayAgo(Math.floor(hrs / 24));
  }

  async function abrirBell() {
    const siguiente = !bellMenu;
    setBellMenu(siguiente);
    if (siguiente && notifs.some(n => !n.leida)) {
      await marcarTodasLeidas();
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    }
  }

  async function limpiar() {
    await limpiarNotificaciones();
    setNotifs([]);
  }

  async function logout() {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 3000));
    await signOut(auth);
    sessionStorage.removeItem("auth");
    localStorage.removeItem("auth");
    router.push("/login");
  }

  const NAV_MAIN = [
    { href: "/dashboard",             icon: LayoutDashboard, label: t.navDashboard    },
    { href: "/clientes",              icon: Users,           label: t.navClientes     },
    { href: "/pedidos",               icon: Package,         label: t.navPedidos      },
    { href: "/mensajes",              icon: MessageSquare,   label: t.navMensajes     },
    { href: "/proyectos",             icon: FolderCheck,     label: t.navProyectos    },
    { href: "/proyectos-cancelados",  icon: FolderX,         label: t.navCancelados   },
    { href: "/fecha-entrega",         icon: CalendarClock,   label: t.navFechaEntrega },
    { href: "/fecha-inicio",          icon: CalendarCheck,   label: t.navFechaInicio  },
  ];

  const NAV_SYSTEM = [
    { href: "/alertas",         icon: Bell,          label: t.navAlertas      },
    { href: "/configuracion",   icon: Settings,      label: t.navConfiguracion},
    { href: "/reporte-tecnico", icon: FileBarChart2, label: t.navReporte      },
  ];

  const c = collapsed;
  const showFull = !c;

  return (
    <div className="panel-root">
      {loggingOut && (
        <div className="page-loader-overlay">
          <div className="dots-loader">
            <span className="dot" /><span className="dot" /><span className="dot" /><span className="dot" />
          </div>
          <p style={{ color: "#6c63ff", fontSize: "0.9rem", letterSpacing: "0.03em" }}>
            Cerrando sesión...
          </p>
        </div>
      )}
      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${c ? " sidebar-collapsed" : ""}`}>

        <div className="sidebar-toggle-row">
          {showFull && (
            <span className="sidebar-brand">
              <span className="sidebar-brand-open">OPEN</span>
              <span className="sidebar-brand-kode">KODE</span>
            </span>
          )}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!c)}
            aria-label={c ? t.expandMenu : t.collapseMenu}
          >
            {showFull ? <PanelLeftClose size={18} strokeWidth={1.8} /> : <PanelLeftOpen size={18} strokeWidth={1.8} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {showFull && <p className="sidebar-section-label">{t.mainMenu}</p>}
          {NAV_MAIN.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-item${active ? " active" : ""}${!showFull ? " sidebar-item-icon-only" : ""}`}
                title={!showFull ? label : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {showFull && <span>{label}</span>}
                {showFull && active && <ChevronRight size={14} className="sidebar-item-arrow" />}
              </Link>
            );
          })}

          <div className="sidebar-divider" />
          {showFull && <p className="sidebar-section-label">{t.system}</p>}
          {NAV_SYSTEM.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-item${active ? " active" : ""}${!showFull ? " sidebar-item-icon-only" : ""}`}
                title={!showFull ? label : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {showFull && <span>{label}</span>}
                {showFull && active && <ChevronRight size={14} className="sidebar-item-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`sidebar-logout-btn${!showFull ? " sidebar-logout-btn-icon" : ""}`}
            onClick={logout}
            title={!showFull ? t.logout : undefined}
          >
            <LogOut size={16} strokeWidth={2} />
            {showFull && <span>{t.logout}</span>}
          </button>
        </div>

      </aside>

      {/* ── CONTENIDO ── */}
      <div className={`panel-wrapper${c ? " panel-wrapper-collapsed" : ""}`}>
        <PageLoader />

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-search">
            <Search size={15} className="topbar-search-icon" strokeWidth={1.8} />
            <input type="text" placeholder={t.searchPH} className="topbar-search-input" />
          </div>
          <div className="topbar-actions">
            <button
              className="topbar-lang-btn"
              onClick={() => setLang(lang === "ES" ? "EN" : "ES")}
              aria-label={t.notifications}
            >
              <Globe size={15} strokeWidth={1.8} />
              <span>{lang}</span>
            </button>
            <div className="topbar-avatar-wrap">
              <button
                className="topbar-icon-btn"
                aria-label={t.notifications}
                onClick={abrirBell}
                style={{ position: "relative" }}
              >
                <Bell size={18} strokeWidth={1.8} />
                {notifs.some(n => !n.leida) && (
                  <span className="bell-unread-dot" />
                )}
              </button>
              {bellMenu && (
                <>
                  <div className="avatar-overlay" onClick={() => setBellMenu(false)} />
                  <div className="avatar-menu bell-menu">
                    <div className="bell-menu-header">
                      <p className="bell-menu-title">{t.notifications}</p>
                      {notifs.length > 0 && (
                        <button className="bell-clear-btn" onClick={limpiar} title={t.clearAll}>
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                    <hr className="avatar-menu-divider" />
                    {notifs.length === 0 ? (
                      <p className="bell-menu-empty">{t.noNotifications}</p>
                    ) : (
                      <div className="bell-notif-list">
                        {notifs.map(n => (
                          <div key={n.id} className={`bell-notif-item${n.leida ? "" : " bell-notif-unread"}`}>
                            <div className="bell-notif-dot" />
                            <div className="bell-notif-body">
                              <p className="bell-notif-msg">{n.mensaje}</p>
                              <p className="bell-notif-time">{tiempoRelativo(n.creadoEn)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="topbar-avatar-wrap">
              <div
                className="topbar-avatar"
                onClick={() => setAvatarMenu(!avatarMenu)}
                role="button"
                aria-label="Menú de usuario"
                style={perfilFoto ? { background: "none", padding: 0, overflow: "hidden" } : {}}
              >
                {perfilFoto
                  ? <img src={perfilFoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : perfilNombre}
              </div>
              {avatarMenu && (
                <>
                  <div className="avatar-overlay" onClick={() => setAvatarMenu(false)} />
                  <div className="avatar-menu">
                    <button className="avatar-menu-item" onClick={() => { setAvatarMenu(false); setChangePwOpen(true); }}>
                      <KeyRound size={14} strokeWidth={1.8} />
                      {t.changePassword}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <Breadcrumb />
        <main className="panel-main">
          {children}
        </main>
      </div>
      <ChangePasswordModal open={changePwOpen} onClose={() => setChangePwOpen(false)} />
      <ToastContainer />
    </div>
  );
}
