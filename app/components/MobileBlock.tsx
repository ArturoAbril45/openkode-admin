"use client";

import { useEffect, useState } from "react";
import { Monitor, Clock, Wifi } from "lucide-react";

export default function MobileBlock() {
  const [isMobile, setIsMobile] = useState(false);
  const [ip,       setIp]       = useState("Obteniendo...");
  const [hora,     setHora]     = useState("");
  const [fecha,    setFecha]    = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => setIp(d.ip))
      .catch(() => setIp("No disponible"));
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    function tick() {
      const now = new Date();
      setHora(now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setFecha(now.toLocaleDateString("es", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#ffffff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", textAlign: "center",
      backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }}>

      {/* Blob decorativo */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "#6c63ff", opacity: 0.08, filter: "blur(80px)",
        top: -100, left: -100, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "#3ecf8e", opacity: 0.07, filter: "blur(70px)",
        bottom: -80, right: -80, pointerEvents: "none",
      }} />

      {/* Icono */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: "#f0effe",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.5rem",
        boxShadow: "0 8px 32px rgba(108,99,255,0.15)",
      }}>
        <Monitor size={34} color="#6c63ff" strokeWidth={1.8} />
      </div>

      {/* Título */}
      <h1 style={{
        fontSize: "1.4rem", fontWeight: 800, color: "#0f0f1a",
        letterSpacing: "-0.5px", marginBottom: "0.5rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        Panel no disponible
      </h1>
      <p style={{
        fontSize: "0.9rem", color: "#6b7280", maxWidth: 280,
        lineHeight: 1.6, marginBottom: "2rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        Este panel de administración está optimizado para <strong>computadoras y laptops</strong>. Por favor accede desde un dispositivo de escritorio.
      </p>

      {/* Info box */}
      <div style={{
        background: "#fff", border: "1.5px solid #e5e7eb",
        borderRadius: 16, padding: "1.1rem 1.4rem",
        width: "100%", maxWidth: 320,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          marginBottom: "0.75rem", paddingBottom: "0.75rem",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Wifi size={14} color="#2563eb" strokeWidth={2} />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Tu IP</p>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f0f1a", margin: 0 }}>{ip}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#f0effe", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Clock size={14} color="#6c63ff" strokeWidth={2} />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Hora local</p>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f0f1a", margin: 0 }}>{hora}</p>
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", margin: 0, textTransform: "capitalize" }}>{fecha}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
