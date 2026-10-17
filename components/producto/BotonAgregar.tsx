"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import type { Producto } from "@/types/catalogo";

const MS_AGREGADO = 1400;

/**
 * "Agregar" de la tarjeta, junto al precio: botón con borde rojo que se llena de rojo al pasar el mouse
 * (menos rojo en la página que una barra llena por tarjeta). En el teléfono es un círculo con "+".
 * Al tocarlo pasa a azul con ✓ un instante.
 */
export default function BotonAgregar({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), MS_AGREGADO);
    return () => clearTimeout(t);
  }, [agregado]);

  return (
    <button
      type="button"
      onClick={() => {
        agregar(producto);
        setAgregado(true);
      }}
      aria-label={agregado ? `${producto.nombre} agregado al carrito` : `Agregar ${producto.nombre} al carrito`}
      className={`group/agregar inline-flex size-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-chip border-2 text-sm font-semibold transition duration-300 ease-(--curva-suave) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:active:scale-[0.96] sm:w-auto sm:rounded-xl sm:px-3.5 ${
        agregado
          ? "border-pico-azul bg-pico-azul text-pico-blanco"
          : "border-pico-rojo bg-pico-blanco text-pico-rojo hover:bg-pico-rojo hover:text-pico-blanco hover:shadow-boton-hover"
      }`}
    >
      {agregado ? (
        <>
          <Check key="ok" className="size-4.5 motion-safe:animate-pop" strokeWidth={3} aria-hidden />
          <span className="hidden sm:inline">Agregado</span>
        </>
      ) : (
        <>
          <Plus className="size-4.5 transition-transform duration-300 ease-(--curva-suave) motion-safe:group-hover/agregar:rotate-90" strokeWidth={2.5} aria-hidden />
          <span className="hidden sm:inline">Agregar</span>
        </>
      )}
    </button>
  );
}
