"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, ShoppingCart, X } from "lucide-react";
import Precio from "@/components/ui/Precio";

export type DatosConfirmacion = {
  /** Unidades que se agregaron al carrito. */
  articulos: number;
  totalUsd: number;
  /** Materiales sin producto, que no entran al carrito. */
  porConsultar: number;
};

type Props = {
  datos: DatosConfirmacion | null;
  alCerrar: () => void;
  alVerCarrito: () => void;
};

/** Confirmación después de "Agregar todo al carrito". Va en portal para que nada la encierre. */
export default function ConfirmacionCarrito({ datos, alCerrar, alVerCarrito }: Props) {
  const botonPrincipal = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!datos) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    document.addEventListener("keydown", alPresionar);
    botonPrincipal.current?.focus();
    return () => document.removeEventListener("keydown", alPresionar);
  }, [datos, alCerrar]);

  if (!datos) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center print:hidden">
      <div className="absolute inset-0 bg-pico-azul-oscuro/55 backdrop-blur-[2px] motion-safe:animate-[aparecer_0.2s_ease-out_both]" onClick={alCerrar} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacion"
        className="relative w-full max-w-md overflow-hidden rounded-banner bg-pico-blanco shadow-tarjeta-hover motion-safe:animate-aparecer"
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-pico-rojo" aria-hidden />
        <button
          type="button"
          onClick={alCerrar}
          className="group absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-chip text-gris-texto transition-colors hover:bg-gris-fondo hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          aria-label="Cerrar"
        >
          <X className="size-5 transition-transform duration-300 motion-safe:group-hover:rotate-90" />
        </button>
        <div className="flex flex-col items-center gap-2 px-6 pt-9 pb-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco motion-safe:animate-latido">
            <Check className="size-8" strokeWidth={2.5} aria-hidden />
          </span>
          <h2 id="titulo-confirmacion" className="mt-1 text-2xl font-bold text-pico-azul">
            ¡Listo! Ya está en tu carrito
          </h2>
          <p className="text-sm text-gris-texto">
            Agregamos {datos.articulos} {datos.articulos === 1 ? "artículo" : "artículos"} por <Precio valor={datos.totalUsd} tamano="pequeno" />.
          </p>
          {datos.porConsultar > 0 && (
            <p className="rounded-tarjeta bg-pico-azul-claro px-3 py-2 text-[13px] leading-snug text-pico-azul">
              {datos.porConsultar === 1 ? "Queda 1 material" : `Quedan ${datos.porConsultar} materiales`} por consultar: escríbenos por WhatsApp y te confirmamos disponibilidad.
            </p>
          )}
          <div className="mt-3 grid w-full gap-2.5 sm:grid-cols-2">
            <button
              ref={botonPrincipal}
              type="button"
              onClick={alVerCarrito}
              className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-boton bg-pico-rojo text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-rojo-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5 sm:order-2"
            >
              <ShoppingCart className="size-5 motion-safe:group-hover:animate-sacudir" aria-hidden />
              Ver carrito
            </button>
            <button
              type="button"
              onClick={alCerrar}
              className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-boton bg-pico-azul text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" aria-hidden />
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
