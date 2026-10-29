"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { claseAccionHeader, estaEn } from "@/components/layout/accionHeader";
import IconoCorazon from "@/components/icons/pico/IconoCorazon";
import { useFavoritos } from "./almacenFavoritos";

/** "Favoritos" del header (desde 768px; en el teléfono está en la barra inferior), con su contador rojo. En /favoritos queda marcado. */
export default function EnlaceFavoritos({ className = "" }: { className?: string }) {
  const { cantidad } = useFavoritos();
  const activo = estaEn(usePathname(), "/favoritos");
  return (
    <Link
      href="/favoritos"
      aria-label={`Favoritos (${cantidad} ${cantidad === 1 ? "producto" : "productos"})`}
      aria-current={activo ? "page" : undefined}
      className={`${claseAccionHeader(activo)} ${className}`}
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
