"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Props {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  searchable?: boolean;
}

export default function CustomSelect({ icon, value, placeholder, options, onChange, searchable = false }: Props) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = searchable
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="form-icon-wrap" onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        {icon}
        <div className="form-input has-icon custom-select-value">
          {selected ? selected.label : <span style={{ color: "#c4cad4" }}>{placeholder}</span>}
        </div>
        <ChevronDown size={14} style={{
          position: "absolute", right: "0.85rem", top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          color: "#b0b7c3", transition: "transform 0.2s", pointerEvents: "none",
        }} />
      </div>

      {open && (
        <div className="custom-select-dropdown">
          {searchable && (
            <div className="custom-select-search">
              <Search size={13} style={{ color: "#b0b7c3", flexShrink: 0 }} strokeWidth={1.8} />
              <input
                autoFocus
                placeholder="Buscar..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="custom-select-search-input"
              />
            </div>
          )}
          <div className="custom-select-list">
            {filtered.map(o => (
              <div
                key={o.value}
                className={`custom-select-option${value === o.value ? " selected" : ""}`}
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
