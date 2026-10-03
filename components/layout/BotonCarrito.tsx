"use client";

import { ShoppingCart } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";

export default function BotonCarrito() {
  const { cantidadTotal, abrir } = useCarrito();
  return (
    <button
      type="button"
      onClick={abrir}
      className="relative rounded-boton p-2 text-pico-blanco hover:bg-pico-azul-oscuro"
      aria-label={`Abrir carrito (${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"})`}
    >
      <ShoppingCart className="size-6" aria-hidden />
      {cantidadTotal > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-chip bg-pico-rojo px-1 text-[11px] leading-5 font-bold text-pico-blanco">
          {cantidadTotal > 99 ? "99+" : cantidadTotal}
        </span>
      )}
    </button>
  );
}
