"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Map as IconoMapa, MapPinned, Navigation, X } from "lucide-react";
import { APPS_MAPAS, TIENDA } from "@/lib/tienda";
import type { AppMapas } from "@/lib/tienda";
import BotonCopiarDireccion from "./BotonCopiarDireccion";

const iconos: Record<AppMapas["id"], typeof IconoMapa> = { google: MapPinned, waze: Navigation, apple: IconoMapa };
const sinSuscripcion = () => () => {};

type Props = { abierto: boolean; cerrar: () => void };

/**
 * Ventana para elegir con qué app abrir la ubicación: Google Maps, Waze o Apple Maps.
 * En el teléfono es una hoja que sube desde abajo; en escritorio, una ventana centrada.
 * Se dibuja en <body> (portal) para que "fixed" no quede encerrado por animaciones.
 */
export default function SelectorMapas({ abierto, cerrar }: Props) {
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionar);
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierto, cerrar]);

  if (!montado) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`} inert={!abierto}>
      <div
        className={`absolute inset-0 bg-texto/50 transition-opacity duration-300 ${abierto ? "opacity-100" : "opacity-0"}`}
        onClick={cerrar}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-selector-mapas"
        className={`absolute inset-x-0 bottom-0 rounded-t-banner bg-pico-blanco p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-tarjeta-hover transition duration-300 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:rounded-banner md:p-6 ${
          abierto
            ? "translate-y-0 opacity-100 md:-translate-y-1/2"
            : "translate-y-full opacity-0 md:-translate-y-[45%] motion-reduce:translate-y-0 md:motion-reduce:-translate-y-1/2"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-chip bg-gris-borde md:hidden" aria-hidden />
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="titulo-selector-mapas" className="text-lg font-bold text-pico-azul">
              ¿Con qué app quieres llegar?
            </h2>
            <p className="text-[13px] text-gris-texto">{TIENDA.nombre}</p>
          </div>
          <button
            ref={botonCerrar}
            type="button"
            onClick={cerrar}
            className="-mt-1 -mr-2 cursor-pointer rounded-boton p-2 text-gris-texto hover:bg-gris-fondo hover:text-texto"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="grid gap-2">
          {APPS_MAPAS.map((app) => {
            const Icono = iconos[app.id];
            return (
              <li key={app.id}>
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={cerrar}
                  className="group flex items-center gap-3 rounded-tarjeta border border-gris-borde p-3 transition duration-200 hover:border-pico-azul/30 hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco transition-colors group-hover:bg-pico-rojo">
                    <Icono className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-texto">{app.nombre}</span>
                    <span className="block text-[13px] text-gris-texto">{app.detalle}</span>
                  </span>
                  <ExternalLink
                    className="size-4 text-gris-texto transition-transform motion-safe:group-hover:translate-x-0.5"
                    aria-hidden
                  />
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-gris-borde pt-4">
          <BotonCopiarDireccion anchoCompleto />
        </div>
      </div>
    </div>,
    document.body,
  );
}
