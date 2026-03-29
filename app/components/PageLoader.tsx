"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const pathname    = usePathname();
  const prevPath    = useRef<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Primera vez que monta: solo guarda el path, no muestra loader
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    // Si el path no cambió (strict mode doble ejecución), ignora
    if (prevPath.current === pathname) return;

    prevPath.current = pathname;
    setVisible(true);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 1000);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="page-loader-overlay">
      <div className="dots-loader">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
