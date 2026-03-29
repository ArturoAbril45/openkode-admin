import { SkeletonTableRow } from "./SkeletonCard";

const ROWS = [
  { name: "Carlos Méndez", email: "carlos@empresa.com", role: "Admin",  status: "Activo"   },
  { name: "Lucía Romero",  email: "lucia@empresa.com",  role: "Editor", status: "Activo"   },
  { name: "Jorge Paredes", email: "jorge@empresa.com",  role: "Viewer", status: "Inactivo" },
  { name: "Ana Torres",    email: "ana@empresa.com",    role: "Editor", status: "Activo"   },
  { name: "Miguel Quispe", email: "miguel@empresa.com", role: "Viewer", status: "Activo"   },
];

interface Props {
  loading: boolean;
}

export default function UsersTable({ loading }: Props) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "1.4rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f0f1a", marginBottom: "1.25rem" }}>
        Usuarios recientes
      </p>

      {loading
        ? [1, 2, 3, 4, 5].map(i => <SkeletonTableRow key={i} />)
        : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                {["Nombre", "Email", "Rol", "Estado"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0 0.75rem 0.75rem", color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ name, email, role, status }) => (
                <tr key={email} style={{ borderBottom: "1px solid #fafafa" }}>
                  <td style={{ padding: "0.65rem 0.75rem", fontWeight: 600, color: "#0f0f1a" }}>{name}</td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "#6b7280" }}>{email}</td>
                  <td style={{ padding: "0.65rem 0.75rem", color: "#6b7280" }}>{role}</td>
                  <td style={{ padding: "0.65rem 0.75rem" }}>
                    <span style={{
                      background: status === "Activo" ? "#edfaf4" : "#f9fafb",
                      color: status === "Activo" ? "#3ecf8e" : "#9ca3af",
                      borderRadius: 50, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600,
                    }}>
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}
