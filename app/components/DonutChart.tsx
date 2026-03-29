interface Slice { label: string; value: number; color: string; }
interface Props  { slices: Slice[]; size?: number; }

export default function DonutChart({ slices, size = 160 }: Props) {
  const total  = slices.reduce((s, x) => s + x.value, 0);
  const r      = 54;
  const cx     = size / 2;
  const cy     = size / 2;
  const stroke = 22;

  let cumulative = 0;
  const arcs = slices.filter(s => s.value > 0).map(s => {
    const pct   = s.value / total;
    const start = cumulative;
    cumulative += pct;
    return { ...s, pct, start };
  });

  function describeArc(startPct: number, endPct: number) {
    const startAngle = startPct * 2 * Math.PI - Math.PI / 2;
    const endAngle   = endPct   * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={describeArc(arc.start, arc.start + arc.pct)}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="1.5rem" fontWeight="800" fill="#0f0f1a">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="0.65rem" fill="#9ca3af">pedidos</text>
      </svg>
      <div className="donut-legend">
        {slices.map(s => (
          <div key={s.label} className="donut-legend-item">
            <span className="donut-legend-dot" style={{ background: s.color }} />
            <span className="donut-legend-label">{s.label}</span>
            <span className="donut-legend-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
