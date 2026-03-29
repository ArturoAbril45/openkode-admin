import { TrendingUp } from "lucide-react";
import { SkeletonChart } from "./SkeletonCard";

const BARS   = [55, 80, 40, 70, 90, 60, 75];
const DAYS   = ["L", "M", "X", "J", "V", "S", "D"];
const PEAK   = 4; // índice del día más alto (viernes)

interface Props {
  loading: boolean;
}

export default function SalesChart({ loading }: Props) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "1.4rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
      {loading ? <SkeletonChart /> : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "1.25rem" }}>
            <TrendingUp size={16} color="#6c63ff" strokeWidth={2} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f0f1a" }}>Ventas semanales</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${h}%`,
                background: i === PEAK ? "#6c63ff" : "#ede9fe",
                borderRadius: 6,
                transition: "height 0.4s ease",
              }} />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {DAYS.map(d => (
              <span key={d} style={{ fontSize: "0.7rem", color: "#9ca3af", flex: 1, textAlign: "center" }}>{d}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
