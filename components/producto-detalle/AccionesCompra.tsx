"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, MessageCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import Precio from "@/components/ui/Precio";
import { registrarSenal } from "@/lib/recomendaciones/almacenPerfil";
import { armarMensajePedido, enlaceWhatsApp } from "@/lib/whatsapp";
import type { Producto } from "@/types/catalogo";
import { fuentePaginas } from "./fuentes";

const sinSuscripcion = () => () => {};
const CANTIDAD_MAXIMA = 999;
const MS_AGREGADO = 1600;

// Botones propios de la página de producto (colores del rebranding + animaciones).
// motion-safe: quien pidió menos movimiento en su sistema no ve las animaciones.
const baseBoton =
  "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-boton px-5 text-base font-semibold transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino";

/** Destello que cruza el botón al pasar el mouse. */
function Brillo() {
  return (
    <span
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-pico-blanco/25 transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[450%]"
      aria-hidden
    />
  );
}

/** Cantidad + "Agregar al carrito" (abre el panel del carrito) + "Comprar ahora" (pedido directo por WhatsApp). */
export default function AccionesCompra({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [barraVisible, setBarraVisible] = useState(false);
  const botones = useRef<HTMLDivElement>(null);
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  const cambiar = (valor: number) => setCantidad(Math.min(CANTIDAD_MAXIMA, Math.max(1, Math.floor(valor) || 1)));

  const alAgregar = () => {
    agregar(producto, cantidad);
    setAgregado(true);
  };

  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), MS_AGREGADO);
    return () => clearTimeout(t);
  }, [agregado]);

  // En móvil, cuando los botones salen de la pantalla aparece una barra fija abajo.
  useEffect(() => {
    const el = botones.current;
    if (!el) return;
    const medir = () => setBarraVisible(el.getBoundingClientRect().bottom < 0);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  const botonAgregar = (compacto = false) => (
    <button
      type="button"
      onClick={alAgregar}
      className={`${baseBoton} ${compacto ? "h-11 px-4 text-sm" : ""} ${
        agregado
          ? "bg-logo-marino text-pico-blanco motion-safe:animate-latido"
          : "bg-logo-rojo text-pico-blanco hover:bg-logo-rojo-oscuro hover:shadow-boton-hover"
      }`}
      aria-live="polite"
    >
      {!agregado && <Brillo />}
      {agregado ? (
        <>
          <Check className="size-5" aria-hidden />
          ¡Agregado!
        </>
      ) : (
        <>
          <ShoppingCart
            className="size-5 transition-transform duration-300 motion-safe:group-hover:-translate-x-0.5 motion-safe:group-hover:-rotate-12"
            aria-hidden
          />
          {compacto ? "Agregar" : "Agregar al carrito"}
        </>
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-logo-marino" id="etiqueta-cantidad">
          Cantidad
        </span>
        <div className="flex items-center overflow-hidden rounded-boton border border-gris-borde bg-pico-blanco">
          <button
            type="button"
            onClick={() => cambiar(cantidad - 1)}
            disabled={cantidad <= 1}
            className="flex size-10 items-center justify-center text-logo-marino transition-colors hover:bg-logo-marino-claro disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Quitar una unidad"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={CANTIDAD_MAXIMA}
            value={cantidad}
            onChange={(e) => cambiar(Number(e.target.value))}
            aria-labelledby="etiqueta-cantidad"
            className="h-10 w-12 [appearance:textfield] border-x border-gris-borde text-center font-titulo text-base font-bold text-logo-marino tabular-nums focus-visible:outline-2 focus-visible:outline-logo-marino [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => cambiar(cantidad + 1)}
            disabled={cantidad >= CANTIDAD_MAXIMA}
            className="flex size-10 items-center justify-center text-logo-marino transition-colors hover:bg-logo-marino-claro disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Agregar una unidad"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div ref={botones} className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
        {botonAgregar()}
        <a
          href={enlaceWhatsApp(armarMensajePedido([{ producto, cantidad }]))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarSenal({ tipo: "whatsapp", id: producto.id })} // perfil de "Te puede interesar"
          className={`${baseBoton} bg-logo-marino text-pico-blanco hover:bg-logo-marino-oscuro hover:shadow-boton-hover`}
        >
          <Brillo />
          <MessageCircle className="size-5" aria-hidden />
          Comprar ahora
          <ArrowRight
            className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            aria-hidden
          />
        </a>
      </div>

      {/* Barra fija en móvil. Portal al <body>: la animación de entrada de la columna haría que "fixed" quede encerrado en ella. */}
      {montado && createPortal(
      <div
        className={`${fuentePaginas} fixed inset-x-0 bottom-0 z-40 border-t border-gris-borde bg-pico-blanco/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-tarjeta-hover backdrop-blur transition-transform duration-300 md:hidden ${
          barraVisible ? "translate-y-0" : "translate-y-full"
        }`}
        inert={!barraVisible}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] text-gris-texto">
              {cantidad} {cantidad === 1 ? "unidad" : "unidades"}
            </p>
            <Precio valor={producto.precio * cantidad} tono="logo" className="font-titulo" />
          </div>
          {botonAgregar(true)}
        </div>
      </div>,
      document.body,
      )}
    </div>
  );
}
