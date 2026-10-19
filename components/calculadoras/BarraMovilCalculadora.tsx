"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ShoppingCart } from "lucide-react";
import PrecioAnimado from "@/components/ui/PrecioAnimado";
import type { EstadoProyecto } from "@/components/calculadoras/useProyecto";

const sinSuscripcion = () => () => {};

type Props = {
  estado: EstadoProyecto;
  /** La lectura ya está en pantalla: la barra se retira para no repetir el total. */
  oculta: boolean;
  idLectura: string;
};

/**
 * Teléfono y tableta: barra fija sobre la barra inferior con el material principal y el total, que cambian mientras
 * escribes. Tocarla baja a la lectura completa; "Agregar" manda todo al carrito. En portal para que nada la encierre.
 */
export default function BarraMovilCalculadora({ estado, oculta, idLectura }: Props) {
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!montado) return null;

  const { lineas, totalUsd, paraCarrito, recienAgregado, agregarTodo, resultado } = estado;
  const primera = lineas.find((l) => l.recomendada !== null && l.cantidad > 0);

  const irALectura = () => document.getElementById(idLectura)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return createPortal(
    <div
      className={`fixed inset-x-0 bottom-(--alto-barra-inferior) z-30 border-t border-gris-borde bg-pico-blanco px-4 pt-2.5 pb-[calc(0.625rem+var(--seguro-inferior))] shadow-tarjeta-hover transition-transform duration-300 lg:hidden print:hidden ${
        oculta ? "pointer-events-none translate-y-[calc(100%+var(--alto-barra-inferior))]" : ""
      }`}
      aria-hidden={oculta || undefined}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={irALectura}
          tabIndex={oculta ? -1 : undefined}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-boton py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-boton bg-pico-azul-oscuro text-pico-blanco">
            <ChevronDown className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-xs font-semibold text-gris-texto">
              {resultado && primera ? (
                <>
                  <span className="text-pico-azul tabular-nums">{primera.cantidad}</span> × {primera.info.nombre}
                </>
              ) : (
                "Faltan medidas · ver lista"
              )}
            </span>
            <PrecioAnimado valor={totalUsd} className="tabular-nums" />
          </span>
        </button>
        <button
          type="button"
          onClick={agregarTodo}
          disabled={paraCarrito.length === 0}
          tabIndex={oculta ? -1 : undefined}
          className={`flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-boton px-4 text-sm font-semibold text-pico-blanco transition duration-200 disabled:cursor-not-allowed disabled:bg-gris-borde disabled:text-gris-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${
            recienAgregado ? "bg-pico-azul" : "bg-pico-rojo"
          }`}
        >
          <ShoppingCart className="size-4" aria-hidden />
          {recienAgregado ? "¡Agregado!" : "Agregar todo"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
