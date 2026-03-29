interface Props { password: string; }

function getStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)               score++;
  if (pw.length >= 12)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;

  if (score <= 1) return { level: 1, label: "Muy débil",  color: "#ef4444" };
  if (score === 2) return { level: 2, label: "Débil",      color: "#f97316" };
  if (score === 3) return { level: 3, label: "Regular",    color: "#f59e0b" };
  if (score === 4) return { level: 4, label: "Fuerte",     color: "#3ecf8e" };
  return               { level: 5, label: "Muy fuerte", color: "#10b981" };
}

export default function PasswordStrength({ password }: Props) {
  const { level, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="pw-strength">
      <div className="pw-strength-bars">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="pw-strength-bar"
            style={{ background: i <= level ? color : "#e5e7eb" }}
          />
        ))}
      </div>
      <span className="pw-strength-label" style={{ color }}>{label}</span>
    </div>
  );
}
