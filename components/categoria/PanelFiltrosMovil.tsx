"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Boton from "@/components/ui/Boton";

type Props = {
  /** Cantidad de filtros activos, para el contador del botón. */
  activos: number;
  children: ReactNode;
};

/** Botón "Filtrar" que abre un panel lateral con los filtros (solo móvil y tablet). */
export default function PanelFiltrosMovil({ activos, children }: Props) {
  const [abierto, setAbierto] = useState(false);
  const botonCerrar = useRef<HTMLButtonElement>(null);

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
      <Boton variante="secundario" onClick={() => setAbierto(true)} aria-haspopup="dialog">
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtrar
        {activos > 0 && (
          <span className="inline-flex size-5 items-center justify-center rounded-chip bg-pico-rojo text-xs text-pico-blanco">
            {activos}
          </span>
        )}
      </Boton>

      <div className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`} inert={!abierto}>
        <div
          className={`absolute inset-0 bg-texto/50 transition-opacity ${abierto ? "opacity-100" : "opacity-0"}`}
          onClick={() => setAbierto(false)}
          aria-hidden
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-filtros"
          className={`absolute top-0 left-0 flex h-full w-full max-w-xs flex-col bg-pico-blanco shadow-tarjeta-hover transition-transform duration-300 ${
            abierto ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gris-borde px-4 py-4">
            <h2 id="titulo-filtros" className="text-xl font-bold text-pico-azul">
              Filtrar
            </h2>
            <button
              ref={botonCerrar}
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-boton p-2 text-gris-texto hover:bg-gris-fondo hover:text-texto"
              aria-label="Cerrar filtros"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4" onClick={alHacerClic}>
            {children}
          </div>
        </aside>
      </div>
    </div>
  );
}
