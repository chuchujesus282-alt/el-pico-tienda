"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Precio from "@/components/ui/Precio";
import ImagenProducto from "@/components/producto/ImagenProducto";
import { armarMensajePedido, enlaceWhatsApp } from "@/lib/whatsapp";
import { useCarrito } from "./ProveedorCarrito";

/** Panel lateral del carrito. No cobra: arma el pedido y lo envía por WhatsApp. */
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
        className={`absolute inset-0 bg-texto/50 transition-opacity ${abierto ? "opacity-100" : "opacity-0"}`}
        onClick={cerrar}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-carrito"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-pico-blanco shadow-tarjeta-hover transition-transform duration-300 ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gris-borde px-4 py-4">
          <h2 id="titulo-carrito" className="text-xl font-bold text-pico-azul">
            Mi carrito {cantidadTotal > 0 && <span className="text-base font-medium text-gris-texto">({cantidadTotal})</span>}
          </h2>
          <button
            ref={botonCerrar}
            type="button"
            onClick={cerrar}
            className="rounded-boton p-2 text-gris-texto hover:bg-gris-fondo hover:text-texto"
            aria-label="Cerrar carrito"
          >
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart className="size-12 text-gris-borde" strokeWidth={1.5} aria-hidden />
            <p className="text-xl font-bold text-pico-azul">Tu carrito está vacío</p>
            <p className="text-[13px] text-gris-texto">Agrega productos del catálogo para armar tu pedido.</p>
            <Boton onClick={cerrar} className="mt-2">
              Seguir comprando
            </Boton>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-gris-borde overflow-y-auto px-4">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex gap-3 py-4">
                  <ImagenProducto
                    src={producto.imagen}
                    alt={producto.nombre}
                    sizes="64px"
                    className="size-16 shrink-0 rounded-boton border border-gris-borde"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-medium">{producto.nombre}</p>
                    <p className="text-[13px] text-gris-texto">Cód. {producto.id}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-boton border border-gris-borde">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                          className="p-2 text-pico-azul hover:bg-gris-fondo"
                          aria-label={`Quitar una unidad de ${producto.nombre}`}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                          {cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                          className="p-2 text-pico-azul hover:bg-gris-fondo"
                          aria-label={`Agregar una unidad de ${producto.nombre}`}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <Precio valor={producto.precio * cantidad} tamano="pequeno" />
                      <button
                        type="button"
                        onClick={() => quitar(producto.id)}
                        className="p-2 text-gris-texto hover:text-pico-rojo"
                        aria-label={`Eliminar ${producto.nombre} del carrito`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-gris-borde bg-gris-fondo px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-pico-azul">Total referencial</span>
                <Precio valor={total} tamano="grande" />
              </div>
              <p className="text-[13px] text-gris-texto">
                No cobramos en la web: te confirmamos disponibilidad y forma de pago por WhatsApp.
              </p>
              <Boton
                href={enlaceWhatsApp(armarMensajePedido(items))}
                target="_blank"
                rel="noopener noreferrer"
                anchoCompleto
              >
                <MessageCircle className="size-5" aria-hidden />
                Enviar pedido por WhatsApp
              </Boton>
              <div className="flex gap-3">
                <Boton variante="secundario" onClick={cerrar} className="flex-1">
                  Seguir comprando
                </Boton>
                <button
                  type="button"
                  onClick={vaciar}
                  className="px-2 text-sm font-semibold text-gris-texto hover:text-pico-rojo"
                >
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
