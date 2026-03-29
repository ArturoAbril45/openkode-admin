import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="notfound-root">
      <div className="notfound-card">
        <div className="notfound-icon">
          <AlertCircle size={40} strokeWidth={1.5} />
        </div>
        <h1 className="notfound-code">404</h1>
        <p className="notfound-title">Página no encontrada</p>
        <p className="notfound-desc">La sección que buscas no existe o fue movida.</p>
        <Link href="/dashboard" className="notfound-btn">
          <Home size={15} strokeWidth={2} />
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
