interface Bar { label: string; value: number; }
interface Props { bars: Bar[]; color?: string; height?: number; }

export default function BarChart({ bars, color = "#6c63ff", height = 140 }: Props) {
  const max = Math.max(...bars.map(b => b.value), 1);

  return (
    <div className="barchart-wrap">
      <div className="barchart-bars" style={{ height }}>
        {bars.map(b => (
          <div key={b.label} className="barchart-col">
            <span className="barchart-val">{b.value > 0 ? b.value : ""}</span>
            <div
              className="barchart-bar"
              style={{
                height: `${(b.value / max) * 100}%`,
                background: color,
                minHeight: b.value > 0 ? "6px" : "0",
              }}
            />
          </div>
        ))}
      </div>
      <div className="barchart-labels">
        {bars.map(b => (
          <span key={b.label} className="barchart-label">{b.label}</span>
        ))}
      </div>
    </div>
  );
}
