"use client";

import { useEffect, useState } from "react";

const DURATION = 5000; // 5 segundos

export default function LoginLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-root">
      <div className="dots-loader">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      <span className="splash-count">{Math.round(progress)}%</span>
      <p className="splash-label">Iniciando sesión...</p>
    </div>
  );
}
