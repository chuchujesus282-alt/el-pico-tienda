"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const EVENTO = "pico:navegando";

/** Para los cambios de página hechos con router.push (no con un enlace): muestra la barra en el acto. */
export function avisarNavegacion() {
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Barra fina arriba que aparece EN EL MISMO toque de un enlace interno y se va cuando llega la página nueva. Así el
 * cliente ve al instante que su toque funcionó, aunque el servidor tarde unas décimas (filtros, orden, inicio).
 */
export default function BarraNavegacion() {
  // La barra se enciende "en" la página actual; cuando llega la nueva (otra dirección), se apaga sola.
  const actual = `${usePathname()}?${useSearchParams().toString()}`;
  const [encendidaEn, setEncendidaEn] = useState<string | null>(null);
  const activa = encendidaEn === actual;

  useEffect(() => {
    const setActiva = (si: boolean) => setEncendidaEn(si ? `${location.pathname}?${location.search.slice(1)}` : null);
    function alTocar(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const objetivo = e.target as Element | null;
      const enlace = objetivo?.closest?.("a");
      if (!enlace || (enlace.target && enlace.target !== "_self") || enlace.hasAttribute("download")) return;
      // Un botón dentro de una tarjeta-enlace (favorito, agregar al carrito) no cambia de página.
      const control = objetivo?.closest("button, input, select, textarea, label, [role='button']");
      if (control && enlace.contains(control)) return;
      const destino = new URL(enlace.href, location.href);
      if (destino.origin !== location.origin) return;
      if (destino.pathname === location.pathname && destino.search === location.search) return; // misma página o #ancla
      setActiva(true);
    }
    const alAviso = () => setActiva(true);
    // Fase de captura: next/link cancela el clic (preventDefault) para navegar sin recargar.
    document.addEventListener("click", alTocar, true);
    window.addEventListener(EVENTO, alAviso);
    return () => {
      document.removeEventListener("click", alTocar, true);
      window.removeEventListener(EVENTO, alAviso);
    };
  }, []);

  // Por si algo cancela la navegación: nunca se queda pegada.
  useEffect(() => {
    if (!activa) return;
    const t = setTimeout(() => setEncendidaEn(null), 10_000);
    return () => clearTimeout(t);
  }, [activa]);

  if (!activa) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]" role="progressbar" aria-label="Cargando página">
      <div className="barra-navegacion h-full bg-logo-rojo" />
    </div>
  );
}
