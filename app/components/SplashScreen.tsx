"use client";

import { useEffect, useState } from "react";


export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [fadeOut,  setFadeOut]  = useState(false);
  const [hidden,   setHidden]   = useState(false);

  useEffect(() => {
    const TOTAL = 5000;
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / TOTAL) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setFadeOut(true), 250);
      setTimeout(() => setHidden(true),  800);
    }
  }, [progress]);

  if (hidden) return null;

  return (
    <div className={`splash-root${fadeOut ? " splash-fade" : ""}`}>
      {/* Dots loader */}
      <div className="dots-loader">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      <span className="splash-count">{Math.round(progress)}%</span>

      <p className="splash-label">Cargando...</p>
    </div>
  );
}
