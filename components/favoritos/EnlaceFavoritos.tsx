"use client";

import Link from "next/link";
import IconoCorazon from "@/components/icons/pico/IconoCorazon";
import { useFavoritos } from "./almacenFavoritos";

/** "Favoritos" del header (desde 768px; en el teléfono está en la barra inferior), con su contador rojo. */
export default function EnlaceFavoritos({ className = "" }: { className?: string }) {
  const { cantidad } = useFavoritos();
  return (
    <Link
      href="/favoritos"
      aria-label={`Favoritos (${cantidad} ${cantidad === 1 ? "producto" : "productos"})`}
      className={`group grupo-icono items-center gap-2 rounded-boton p-2.5 text-sm font-semibold text-pico-azul cursor-pointer ring-1 ring-transparent transition duration-200 hover:bg-pico-blanco hover:shadow-tarjeta hover:ring-pico-azul/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${className}`}
    >
      <span className="relative">
        <IconoCorazon className="size-7" />
        {cantidad > 0 && (
          <span
            key={cantidad}
            className="absolute -top-2 -right-2.5 flex min-w-5 items-center justify-center rounded-chip bg-pico-rojo px-1 text-[11px] leading-5 font-bold text-pico-blanco tabular-nums ring-2 ring-pico-blanco motion-safe:animate-latido"
          >
            {cantidad > 99 ? "99+" : cantidad}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Favoritos</span>
    </Link>
  );
}
