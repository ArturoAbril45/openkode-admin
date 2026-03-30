"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useLang } from "../lib/LangContext";

export default function Breadcrumb() {
  const pathname = usePathname();
  const { t }    = useLang();
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length || segments[0] === "login") return null;

  const LABELS: Record<string, string> = {
    dashboard:             t.navDashboard,
    clientes:              t.navClientes,
    pedidos:               t.navPedidos,
    mensajes:              t.navMensajes,
    proyectos:             t.navProyectos,
    "proyectos-cancelados":t.navCancelados,
    "fecha-entrega":       t.navFechaEntrega,
    "fecha-inicio":        t.navFechaInicio,
    alertas:               t.navAlertas,
    pagos:                 t.navPagos,
    configuracion:         t.navConfiguracion,
    "reporte-tecnico":     t.navReporte,
  };

  return (
    <nav className="breadcrumb">
      <Link href="/dashboard" className="breadcrumb-home">
        <Home size={13} strokeWidth={2} />
      </Link>
      {segments.map((seg, i) => {
        const href  = "/" + segments.slice(0, i + 1).join("/");
        const label = LABELS[seg] ?? seg;
        const last  = i === segments.length - 1;
        return (
          <span key={href} className="breadcrumb-item">
            <ChevronRight size={12} className="breadcrumb-sep" />
            {last
              ? <span className="breadcrumb-current">{label}</span>
              : <Link href={href} className="breadcrumb-link">{label}</Link>
            }
          </span>
        );
      })}
    </nav>
  );
}
