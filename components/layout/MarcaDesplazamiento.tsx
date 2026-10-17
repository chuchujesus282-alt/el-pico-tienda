"use client";

import { useEffect } from "react";

/**
 * Marca <html data-desplazado> en cuanto se baja un poco la página. El Header (fijo arriba desde 768px)
 * lo usa para volverse translúcido, con desenfoque y sombra, y achicar el logo. No dibuja nada.
 */
export default function MarcaDesplazamiento() {
  useEffect(() => {
    const html = document.documentElement;
    let ultimo = false;
    const revisar = () => {
      const bajado = window.scrollY > 8;
      if (bajado === ultimo) return;
      ultimo = bajado;
      if (bajado) html.setAttribute("data-desplazado", "");
      else html.removeAttribute("data-desplazado");
    };
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => {
      window.removeEventListener("scroll", revisar);
      html.removeAttribute("data-desplazado");
    };
  }, []);
  return null;
}
