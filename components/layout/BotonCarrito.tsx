"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import BotonCarritoFlotante from "@/components/carrito/BotonCarritoFlotante";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";

export default function BotonCarrito() {
  const { cantidadTotal, abrir } = useCarrito();
  const boton = useRef<HTMLButtonElement>(null);
  const [enVista, setEnVista] = useState(true);

  // Cuando este botón sale de la pantalla (el cliente bajó), aparece el carrito flotante.
  useEffect(() => {
    const el = boton.current;
    if (!el) return;
    const observador = new IntersectionObserver(([entrada]) => setEnVista(entrada.isIntersecting));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={abrir}
        className="group flex items-center gap-2 rounded-boton p-2 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
        aria-label={`Abrir carrito (${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"})`}
      >
        <span className="relative">
          <ShoppingCart className="size-6 motion-safe:group-hover:animate-sacudir" aria-hidden />
          {cantidadTotal > 0 && (
            // key: cada vez que cambia la cantidad, el contador vuelve a montarse y "late".
            <span
              key={cantidadTotal}
              className="absolute -top-2 -right-2.5 flex min-w-5 items-center justify-center rounded-chip bg-pico-rojo px-1 text-[11px] leading-5 font-bold text-pico-blanco tabular-nums ring-2 ring-pico-blanco motion-safe:animate-latido"
            >
              {cantidadTotal > 99 ? "99+" : cantidadTotal}
            </span>
          )}
        </span>
        <span className="hidden lg:inline">Carrito</span>
      </button>
      <BotonCarritoFlotante visible={!enVista} />
    </>
  );
}
