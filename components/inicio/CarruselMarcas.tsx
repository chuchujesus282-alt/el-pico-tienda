"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TituloSeccion from "@/components/ui/TituloSeccion";
import type { Marca } from "./contenidoInicio";

type Props = {
  titulo: string;
  marcas: Marca[];
  className?: string;
};

// Mismas flechas que CarruselProductos (más foco visible), para que ambos carruseles se vean iguales.
const claseFlecha =
  "hidden size-9 items-center justify-center rounded-chip border border-gris-borde bg-pico-blanco text-pico-azul shadow-tarjeta transition-colors hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:flex";

/** Fila de marcas en recuadros planos (informativos, no enlaces). Sin logo, muestra el nombre. */
export default function CarruselMarcas({ titulo, marcas, className = "" }: Props) {
  const fila = useRef<HTMLUListElement>(null);

  const desplazar = (direccion: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (marcas.length === 0) return null;

  return (
    <section className={className}>
      <TituloSeccion
        titulo={titulo}
        acciones={
          <>
            <button type="button" onClick={() => desplazar(-1)} className={claseFlecha} aria-label="Marcas anteriores">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => desplazar(1)} className={claseFlecha} aria-label="Marcas siguientes">
              <ChevronRight className="size-4" />
            </button>
          </>
        }
      />
      <ul
        ref={fila}
        className="sin-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 md:mx-0 md:scroll-px-0 md:gap-4 md:px-0"
      >
        {marcas.map((marca) => (
          <li key={marca.nombre} className="w-32 shrink-0 snap-start md:w-40">
            <div className="relative flex h-20 items-center justify-center rounded-tarjeta border border-gris-borde bg-pico-blanco px-3 md:h-24">
              {marca.logo ? (
                <Image src={marca.logo} alt={marca.nombre} fill sizes="160px" className="object-contain p-4" />
              ) : (
                <span className="line-clamp-2 text-center text-sm font-extrabold tracking-wide break-words text-pico-azul md:text-base">
                  {marca.nombre}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
