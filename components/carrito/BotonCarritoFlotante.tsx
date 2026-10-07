"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCarrito } from "./ProveedorCarrito";

const sinSuscripcion = () => () => {};

/**
 * Bola flotante abajo a la derecha que abre el carrito desde cualquier punto de la página.
 * La controla `BotonCarrito` (header): aparece cuando el cliente bajó y el carrito de arriba ya no se ve.
 */
export default function BotonCarritoFlotante({ visible }: { visible: boolean }) {
  const { cantidadTotal, abrir, abierto } = useCarrito();
  const ruta = usePathname();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!montado) return null;

  const mostrar = visible && !abierto;
  // En móvil la página de producto tiene su propia barra fija abajo: la bola sube para no taparla.
  const sobreBarra = ruta.startsWith("/producto/");

  // Portal al <body>: así "fixed" no queda encerrado en un contenedor con animación.
  return createPortal(
    <button
      type="button"
      onClick={abrir}
      inert={!mostrar}
      aria-label={`Abrir carrito (${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"})`}
      className={`group fixed right-4 z-40 flex size-14 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco shadow-tarjeta-hover transition duration-300 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:right-6 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] ${
        sobreBarra ? "bottom-[calc(6rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1rem+env(safe-area-inset-bottom))]"
      } ${
        mostrar
          ? "scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-75 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100"
      }`}
    >
      <ShoppingCart className="size-6 motion-safe:group-hover:animate-sacudir" aria-hidden />
      {cantidadTotal > 0 && (
        // key: cada vez que cambia la cantidad, el contador vuelve a montarse y "late".
        <span
          key={cantidadTotal}
          className="absolute -top-1 -right-1 flex min-w-6 items-center justify-center rounded-chip bg-pico-rojo px-1 text-xs leading-6 font-bold text-pico-blanco tabular-nums ring-2 ring-pico-blanco motion-safe:animate-latido"
        >
          {cantidadTotal > 99 ? "99+" : cantidadTotal}
        </span>
      )}
    </button>,
    document.body,
  );
}
