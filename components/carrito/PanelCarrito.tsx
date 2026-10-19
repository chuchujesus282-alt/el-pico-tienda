"use client";

import { useEffect, useRef } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCarrito } from "./ProveedorCarrito";
import ContenidoCarrito from "./ContenidoCarrito";

/**
 * Panel lateral del carrito, SOLO desde 768px (en el teléfono el carrito es la página `/carrito`, una pestaña de
 * la barra inferior). No cobra: arma el pedido y lo envía por WhatsApp.
 * Entra deslizándose desde la derecha; los productos aparecen en cascada cada vez que se abre.
 */
export default function PanelCarrito() {
  const { cantidadTotal, abierto, cerrar } = useCarrito();
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

  return (
    <div className={`fixed inset-0 z-50 max-md:hidden ${abierto ? "" : "pointer-events-none"}`} inert={!abierto}>
      <div
        className={`absolute inset-0 bg-pico-azul-oscuro/55 backdrop-blur-[2px] transition-opacity duration-300 ${
          abierto ? "opacity-100" : "opacity-0"
        }`}
        onClick={cerrar}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-carrito"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col overflow-hidden bg-pico-blanco shadow-tarjeta-hover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:rounded-l-banner ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado azul marino con el filete rojo de la marca, como el resumen de "Finalizar pedido". */}
        <div className="relative bg-gradient-to-br from-pico-azul to-pico-azul-oscuro px-5 py-4 text-pico-blanco">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-tarjeta bg-pico-blanco/10 ring-1 ring-pico-blanco/15">
                <ShoppingCart className="size-5" aria-hidden />
              </span>
              <div>
                <h2 id="titulo-carrito" className="font-titulo text-2xl leading-none font-bold">
                  Mi carrito
                </h2>
                {cantidadTotal > 0 && (
                  <p key={cantidadTotal} className="mt-1 text-xs font-semibold text-pico-blanco/70 motion-safe:animate-aparecer">
                    {cantidadTotal} {cantidadTotal === 1 ? "artículo" : "artículos"}
                  </p>
                )}
              </div>
            </div>
            <button
              ref={botonCerrar}
              type="button"
              onClick={cerrar}
              className="group flex size-10 cursor-pointer items-center justify-center rounded-chip bg-pico-blanco/10 text-pico-blanco transition duration-300 hover:bg-pico-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
              aria-label="Cerrar carrito"
            >
              <X className="size-5 transition-transform duration-300 motion-safe:group-hover:rotate-90" />
            </button>
          </div>
          <span className="absolute inset-x-0 bottom-0 h-1 bg-pico-rojo" aria-hidden />
        </div>

        {/* La clave cambia al abrir: así la cascada de entrada se repite cada vez. */}
        <ContenidoCarrito modo="panel" alCerrar={cerrar} claveCascada={abierto ? "abierto" : "cerrado"} />
      </aside>
    </div>
  );
}
