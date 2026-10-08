"use client";

import { ArrowUp } from "lucide-react";

/** Botón del pie de página que sube al inicio de la página (suave, salvo con "reducir movimiento"). */
export default function VolverArriba() {
  const subir = () => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={subir}
      className="group inline-flex cursor-pointer items-center gap-2 rounded-chip border border-pico-blanco/20 px-3 py-1.5 text-xs font-semibold tracking-[0.15em] text-pico-blanco/80 uppercase transition duration-200 hover:border-pico-rojo hover:bg-pico-rojo hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
    >
      Volver arriba
      <ArrowUp className="size-3.5 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:animate-latido" aria-hidden />
    </button>
  );
}
