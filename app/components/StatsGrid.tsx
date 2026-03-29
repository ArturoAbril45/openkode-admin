import { Users, DollarSign, Package, Bell } from "lucide-react";
import { SkeletonStatCard } from "./SkeletonCard";

const STATS = [
  { title: "Usuarios",   value: "1,248", icon: Users,      color: "#6c63ff", bg: "#f0effe" },
  { title: "Ventas hoy", value: "$3,840", icon: DollarSign, color: "#3ecf8e", bg: "#edfaf4" },
  { title: "Pedidos",    value: "84",    icon: Package,    color: "#f59e0b", bg: "#fef9ec" },
  { title: "Alertas",    value: "3",     icon: Bell,       color: "#ef4444", bg: "#fef2f2" },
];

interface Props {
  loading: boolean;
}

export default function StatsGrid({ loading }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
      {loading
        ? [1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)
        : STATS.map(({ title, value, icon: Icon, color, bg }) => (
          <div key={title} style={{
            background: "#fff", borderRadius: 16, padding: "1.25rem 1.4rem",
            display: "flex", alignItems: "center", gap: "1rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0",
          }}>
            <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={22} color={color} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 2 }}>{title}</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</p>
            </div>
          </div>
        ))}
    </div>
  );
}
