"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const MESES_NOMBRES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

export default function DatePicker({ icon, value, placeholder, onChange }: Props) {
  const today    = new Date();
  const initDate = value ? new Date(value + "T00:00:00") : today;

  const [open, setOpen]   = useState(false);
  const [month, setMonth] = useState(initDate.getMonth());
  const [year,  setYear]  = useState(initDate.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const d = new Date(year, month, day);
    const str = d.toISOString().split("T")[0];
    onChange(str);
    setOpen(false);
  }

  function getDays() {
    const firstDay = new Date(year, month, 1).getDay();
    const total    = new Date(year, month + 1, 0).getDate();
    return { firstDay, total };
  }

  const { firstDay, total } = getDays();
  const selectedDay = value ? new Date(value + "T00:00:00").getDate() : null;
  const selectedMonth = value ? new Date(value + "T00:00:00").getMonth() : null;
  const selectedYear  = value ? new Date(value + "T00:00:00").getFullYear() : null;

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="form-icon-wrap" onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        {icon}
        <div className="form-input has-icon custom-select-value">
          {displayValue || <span style={{ color: "#c4cad4" }}>{placeholder}</span>}
        </div>
        <ChevronDown size={14} style={{
          position: "absolute", right: "0.85rem", top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          color: "#b0b7c3", transition: "transform 0.2s", pointerEvents: "none",
        }} />
      </div>

      {open && (
        <div className="datepicker-dropdown">
          {/* Header */}
          <div className="datepicker-header">
            <button className="datepicker-nav" onClick={prevMonth}><ChevronLeft size={15} /></button>
            <span className="datepicker-title">{MESES_NOMBRES[month]} {year}</span>
            <button className="datepicker-nav" onClick={nextMonth}><ChevronRight size={15} /></button>
          </div>

          {/* Días de la semana */}
          <div className="datepicker-grid">
            {DIAS.map(d => (
              <div key={d} className="datepicker-weekday">{d}</div>
            ))}

            {/* Celdas vacías */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {/* Días */}
            {Array.from({ length: total }).map((_, i) => {
              const day     = i + 1;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSel   = day === selectedDay && month === selectedMonth && year === selectedYear;
              return (
                <button
                  key={day}
                  className={`datepicker-day${isToday ? " today" : ""}${isSel ? " selected" : ""}`}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
