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
  "hidden size-9 items-center justify-center rounded-chip border border-gris-borde bg-pico-blanco text-pico-azul shadow-tarjeta transition duration-200 hover:bg-pico-azul hover:text-pico-blanco motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:flex";

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
            <div className="group relative flex h-20 items-center justify-center overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco px-3 shadow-tarjeta transition duration-300 hover:border-pico-azul/25 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 md:h-24">
              <span
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden
              />
              {marca.logo ? (
                <Image src={marca.logo} alt={marca.nombre} fill sizes="160px" className="object-contain p-4 grayscale transition duration-300 group-hover:grayscale-0" />
              ) : (
                <span className="line-clamp-2 text-center text-sm font-bold tracking-[0.12em] break-words text-pico-azul transition-colors group-hover:text-pico-rojo md:text-base">
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
