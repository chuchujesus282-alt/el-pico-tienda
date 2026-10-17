"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritos } from "./almacenFavoritos";

/** "Favoritos" del header (desde 768px; en el teléfono está en la barra inferior), con su contador rojo. */
export default function EnlaceFavoritos({ className = "" }: { className?: string }) {
  const { cantidad } = useFavoritos();
  return (
    <Link
      href="/favoritos"
      aria-label={`Favoritos (${cantidad} ${cantidad === 1 ? "producto" : "productos"})`}
      className={`group items-center gap-2 rounded-boton p-2.5 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${className}`}
    >
      <span className="relative">
        <Heart className="size-6 transition-transform duration-300 motion-safe:group-hover:scale-110" aria-hidden />
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
