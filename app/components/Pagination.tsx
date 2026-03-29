"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  total:       number;
  perPage:     number;
  current:     number;
  onChange:    (page: number) => void;
}

export default function Pagination({ total, perPage, current, onChange }: Props) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const items: (number | "...")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= current - 1 && i <= current + 1)) {
      items.push(i);
    } else if (items[items.length - 1] !== "...") {
      items.push("...");
    }
  }

  return (
    <div className="pagination">
      <button className="pagination-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>
        <ChevronLeft size={14} strokeWidth={2} />
      </button>

      {items.map((item, i) =>
        item === "..." ? (
          <span key={`dots-${i}`} className="pagination-dots">…</span>
        ) : (
          <button
            key={item}
            className={`pagination-btn ${current === item ? "pagination-btn-active" : ""}`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button className="pagination-btn" disabled={current === pages} onClick={() => onChange(current + 1)}>
        <ChevronRight size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
