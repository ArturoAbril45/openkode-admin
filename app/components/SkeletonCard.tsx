export function SkeletonStatCard() {
  return (
    <div className="sk-stat-card">
      <div className="sk-icon" />
      <div className="sk-lines">
        <div className="sk-line sk-line-sm" />
        <div className="sk-line sk-line-lg" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="sk-row">
      <div className="sk-cell sk-cell-avatar" />
      <div className="sk-cell sk-cell-md"  />
      <div className="sk-cell sk-cell-sm"  />
      <div className="sk-cell sk-cell-lg"  />
      <div className="sk-cell sk-cell-xs"  />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="sk-chart">
      <div className="sk-line sk-line-sm mb-3" style={{ width: 120 }} />
      <div className="sk-bars">
        {[55, 80, 40, 70, 90, 60, 75].map((h, i) => (
          <div key={i} className="sk-bar" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
