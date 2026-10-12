"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Precio from "@/components/ui/Precio";
import ImagenProducto from "@/components/producto/ImagenProducto";
import { tituloProducto } from "@/lib/formato";
import { registrarSenales } from "@/lib/recomendaciones/almacenPerfil";
import { armarMensajePedido, enlaceWhatsApp } from "@/lib/whatsapp";
import { useCarrito } from "./ProveedorCarrito";

const claseFoco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

/**
 * Panel lateral del carrito. No cobra: arma el pedido y lo envía por WhatsApp.
 * Entra deslizándose desde la derecha; los productos aparecen en cascada cada vez que se abre.
 */
export default function PanelCarrito() {
  const { items, total, cantidadTotal, cambiarCantidad, quitar, vaciar, abierto, cerrar } = useCarrito();
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
    <div className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`} inert={!abierto}>
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

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center motion-safe:animate-aparecer">
            <span className="mb-1 flex size-24 items-center justify-center rounded-chip bg-pico-azul-claro motion-safe:animate-flotar">
              <ShoppingCart className="size-11 text-pico-azul" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="font-titulo text-2xl font-bold text-pico-azul">Tu carrito está vacío</p>
            <p className="max-w-60 text-sm text-gris-texto">Agrega productos del catálogo para armar tu pedido.</p>
            <Boton onClick={cerrar} className="mt-2">
              <ArrowLeft className="size-4 transition-transform motion-safe:group-hover/boton:-translate-x-1" aria-hidden />
              Seguir comprando
            </Boton>
          </div>
        ) : (
          <>
            {/* La clave cambia al abrir: así la cascada de entrada se repite cada vez. */}
            <ul key={abierto ? "abierto" : "cerrado"} className="flex-1 space-y-3 overflow-y-auto bg-gris-fondo px-4 py-4">
              {items.map(({ producto, cantidad }, i) => (
                <li
                  key={producto.id}
                  className="group/item flex gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta transition duration-300 hover:border-pico-azul/20 hover:shadow-tarjeta-hover motion-safe:animate-aparecer"
                  style={{ animationDelay: `${150 + Math.min(i, 8) * 60}ms` }}
                >
                  <ImagenProducto
                    src={producto.imagen}
                    alt={producto.nombre}
                    sizes="72px"
                    className="size-[72px] shrink-0 rounded-boton border border-gris-borde transition-transform duration-300 motion-safe:group-hover/item:scale-105"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm leading-snug font-semibold text-texto">{tituloProducto(producto)}</p>
                        <p className="mt-0.5 text-xs text-gris-texto">Cód. {producto.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitar(producto.id)}
                        className={`group/quitar -mt-1 -mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-chip text-gris-texto transition-colors hover:bg-pico-rojo/10 hover:text-pico-rojo ${claseFoco}`}
                        aria-label={`Eliminar ${producto.nombre} del carrito`}
                      >
                        <Trash2 className="size-4 motion-safe:group-hover/quitar:animate-sacudir" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center rounded-chip border border-gris-borde bg-pico-blanco">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                          className={`flex size-8 cursor-pointer items-center justify-center rounded-chip text-pico-azul transition-colors hover:bg-pico-azul-claro ${claseFoco}`}
                          aria-label={`Quitar una unidad de ${producto.nombre}`}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span
                          key={cantidad}
                          className="w-8 text-center font-titulo text-sm font-bold text-pico-azul tabular-nums motion-safe:animate-latido"
                          aria-live="polite"
                        >
                          {cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                          className={`flex size-8 cursor-pointer items-center justify-center rounded-chip text-pico-azul transition-colors hover:bg-pico-azul-claro ${claseFoco}`}
                          aria-label={`Agregar una unidad de ${producto.nombre}`}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <Precio valor={producto.precio * cantidad} tamano="pequeno" className="font-titulo" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-gris-borde bg-pico-blanco px-5 pt-4 pb-5">
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-pico-azul">Total referencial</span>
                <span key={total} className="motion-safe:animate-latido">
                  <Precio valor={total} tamano="grande" className="font-titulo md:text-3xl" />
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gris-texto">
                No cobramos en la web: te confirmamos disponibilidad y forma de pago por WhatsApp.
              </p>
              <Boton
                href={enlaceWhatsApp(armarMensajePedido(items))}
                target="_blank"
                rel="noopener noreferrer"
                // Señal más fuerte del perfil de "Te puede interesar": lo que el cliente pidió.
                onClick={() => registrarSenales(items.map((i) => ({ tipo: "whatsapp", id: i.producto.id })))}
                anchoCompleto
                className="h-12 text-base"
              >
                <ShoppingBag className="size-5" aria-hidden />
                Finalizar compra
                <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover/boton:translate-x-1" aria-hidden />
              </Boton>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cerrar}
                  className={`group flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-boton bg-pico-azul text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] ${claseFoco}`}
                >
                  <ArrowLeft className="size-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" aria-hidden />
                  Seguir comprando
                </button>
                <button
                  type="button"
                  onClick={vaciar}
                  className={`group flex h-11 cursor-pointer items-center gap-1.5 rounded-boton px-3 text-sm font-semibold text-gris-texto transition-colors hover:bg-pico-rojo/10 hover:text-pico-rojo ${claseFoco}`}
                >
                  <Trash2 className="size-4 motion-safe:group-hover:animate-sacudir" aria-hidden />
                  Vaciar
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
