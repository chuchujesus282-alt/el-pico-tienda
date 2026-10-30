"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import Boton from "@/components/ui/Boton";
import Precio from "@/components/ui/Precio";
import ImagenProducto from "@/components/producto/ImagenProducto";
import { descripcionProducto, tituloProducto } from "@/lib/formato";
import { useCarrito } from "./ProveedorCarrito";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";

const claseFoco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

const claseSeguir = `group flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-boton bg-pico-azul text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] ${claseFoco}`;

type Props = {
  /**
   * "panel": dentro de `PanelCarrito` (escritorio), con la lista desplazable y "Seguir comprando" que cierra el panel.
   * "pagina": la página `/carrito` (pestaña del teléfono): la lista ocupa la página, el total queda fijo abajo sobre la
   * barra inferior y "Seguir comprando" lleva al inicio.
   */
  modo: "panel" | "pagina";
  /** Cierra el panel (solo en modo "panel"). */
  alCerrar?: () => void;
  /** Si cambia, la cascada de entrada de los productos se repite (el panel la cambia cada vez que se abre). */
  claveCascada?: string;
};

/** Lista de productos del carrito, total y botones para finalizar. No cobra: el pedido sale por WhatsApp. */
export default function ContenidoCarrito({ modo, alCerrar, claveCascada }: Props) {
  const { items, total, cambiarCantidad, quitar, vaciar } = useCarrito();
  const enPagina = modo === "pagina";

  if (items.length === 0) {
    return (
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center motion-safe:animate-aparecer ${
          enPagina ? "py-12" : ""
        }`}
      >
        <span className="mb-1 flex size-24 items-center justify-center rounded-chip bg-pico-azul-claro motion-safe:animate-flotar">
          <ShoppingCart className="size-11 text-pico-azul" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="font-titulo text-2xl font-bold text-pico-azul">Tu carrito está vacío</p>
        <p className="max-w-60 text-sm text-gris-texto">Agrega productos del catálogo para armar tu pedido.</p>
        {enPagina ? (
          <Boton href="/" className="mt-2">
            <ArrowLeft className="size-4 transition-transform motion-safe:group-hover/boton:-translate-x-1" aria-hidden />
            Seguir comprando
          </Boton>
        ) : (
          <Boton onClick={alCerrar} className="mt-2">
            <ArrowLeft className="size-4 transition-transform motion-safe:group-hover/boton:-translate-x-1" aria-hidden />
            Seguir comprando
          </Boton>
        )}
        <Link
          href={RUTA_CALCULADORAS}
          onClick={alCerrar}
          className="group mt-3 inline-flex items-center gap-1.5 rounded-boton px-2 py-1 text-[13px] font-semibold text-pico-azul transition-colors hover:text-pico-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
        >
          <IconoCalculadora className="size-5 motion-safe:group-hover:animate-sacudir" />
          ¿No sabes cuánto material necesitas? Calcúlalo
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul
        key={claveCascada}
        className={enPagina ? "space-y-3" : "flex-1 space-y-3 overflow-y-auto bg-gris-fondo px-4 py-4"}
      >
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
                  {descripcionProducto(producto) && (
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug font-semibold text-pico-azul-medio">{descripcionProducto(producto)}</p>
                  )}
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

      {/* En la página, el total queda pegado abajo (sobre la barra inferior del teléfono) mientras bajas por la lista. */}
      <div
        className={
          enPagina
            ? "sticky bottom-(--alto-barra-inferior) z-10 mt-4 space-y-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta-hover md:bottom-4"
            : "space-y-3 border-t border-gris-borde bg-pico-blanco px-5 pt-4 pb-5"
        }
      >
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold text-pico-azul">Total referencial</span>
          <span key={total} className="motion-safe:animate-latido">
            <Precio valor={total} tamano="grande" className="font-titulo md:text-3xl" />
          </span>
        </div>
        <p className="text-xs leading-relaxed text-gris-texto">
          No cobramos en la web: te confirmamos disponibilidad y forma de pago por WhatsApp.
        </p>
        {/* El pedido se cierra en /finalizar-pedido (retiro + pago) y de ahí sale a WhatsApp. */}
        <Boton href="/finalizar-pedido" onClick={alCerrar} anchoCompleto className="h-12 text-base">
          <ShoppingBag className="size-5" aria-hidden />
          Finalizar compra
          <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover/boton:translate-x-1" aria-hidden />
        </Boton>
        <div className="flex items-center gap-3">
          {enPagina ? (
            <Link href="/" className={claseSeguir}>
              <ArrowLeft className="size-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" aria-hidden />
              Seguir comprando
            </Link>
          ) : (
            <button type="button" onClick={alCerrar} className={claseSeguir}>
              <ArrowLeft className="size-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" aria-hidden />
              Seguir comprando
            </button>
          )}
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
  );
}
