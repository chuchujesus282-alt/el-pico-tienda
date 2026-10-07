"use client";

import { ShoppingCart } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";

export default function BotonCarrito() {
  const { cantidadTotal, abrir } = useCarrito();
  return (
    <button
      type="button"
      onClick={abrir}
      className="flex items-center gap-2 rounded-boton p-2 text-sm font-semibold text-pico-azul transition-colors hover:bg-gris-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
      aria-label={`Abrir carrito (${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"})`}
    >
      <span className="relative">
        <ShoppingCart className="size-6" aria-hidden />
        {cantidadTotal > 0 && (
          <span className="absolute -top-2 -right-2.5 flex min-w-5 items-center justify-center rounded-chip bg-pico-rojo px-1 text-[11px] leading-5 font-bold text-pico-blanco tabular-nums ring-2 ring-pico-blanco">
            {cantidadTotal > 99 ? "99+" : cantidadTotal}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Carrito</span>
    </button>
  );
}
