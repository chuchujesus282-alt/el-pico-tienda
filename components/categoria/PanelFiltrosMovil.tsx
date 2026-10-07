"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

type Props = {
  /** Cantidad de filtros activos, para el contador del botón. */
  activos: number;
  children: ReactNode;
};

const sinSuscripcion = () => () => {};

/** Botón "Filtrar" que abre un panel lateral con los filtros (solo móvil y tablet). */
export default function PanelFiltrosMovil({ activos, children }: Props) {
  const [abierto, setAbierto] = useState(false);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionar);
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierto]);

  // Al elegir un filtro (un enlace) se cierra el panel.
  const alHacerClic = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a")) setAbierto(false);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-haspopup="dialog"
        className="group inline-flex h-10 items-center gap-2 rounded-boton border-2 border-logo-marino bg-pico-blanco px-4 text-sm font-semibold text-logo-marino transition duration-200 hover:bg-logo-marino hover:text-pico-blanco motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino"
      >
        <SlidersHorizontal className="size-4 transition-transform duration-300 motion-safe:group-hover:rotate-90" aria-hidden />
        Filtrar
        {activos > 0 && (
          <span className="inline-flex size-5 items-center justify-center rounded-chip bg-logo-rojo text-xs text-pico-blanco motion-safe:animate-latido">
            {activos}
          </span>
        )}
      </button>

      {/* Portal al <body>: así "fixed" ocupa toda la pantalla aunque algún contenedor tenga animación. */}
      {montado &&
        createPortal(
          <div className={`fixed inset-0 z-50 lg:hidden ${abierto ? "" : "pointer-events-none"}`} inert={!abierto}>
            <div
              className={`absolute inset-0 bg-logo-marino-oscuro/60 transition-opacity duration-300 ${abierto ? "opacity-100" : "opacity-0"}`}
              onClick={() => setAbierto(false)}
              aria-hidden
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-filtros"
              className={`absolute top-0 left-0 flex h-full w-full max-w-xs flex-col bg-pico-blanco shadow-tarjeta-hover transition-transform duration-300 ease-out ${
                abierto ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between bg-logo-marino px-4 py-4">
                <h2 id="titulo-filtros" className="flex items-center gap-2 font-titulo text-xl font-bold text-pico-blanco">
                  <SlidersHorizontal className="size-5" aria-hidden />
                  Filtrar
                </h2>
                <button
                  ref={botonCerrar}
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="rounded-boton p-2 text-pico-blanco/80 transition-colors hover:bg-pico-blanco/15 hover:text-pico-blanco"
                  aria-label="Cerrar filtros"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5" onClick={alHacerClic}>
                {children}
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
