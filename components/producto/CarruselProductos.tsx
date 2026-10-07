"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TituloSeccion from "@/components/ui/TituloSeccion";
import type { Producto } from "@/types/catalogo";
import ProductCard from "./ProductCard";

type Props = {
  titulo: string;
  productos: Producto[];
  /** Destino del enlace "Ver todo". */
  href?: string;
  className?: string;
};

const claseFlecha =
  "hidden size-9 items-center justify-center rounded-chip border border-gris-borde bg-pico-blanco text-pico-azul shadow-tarjeta transition duration-200 hover:bg-pico-azul hover:text-pico-blanco motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:flex";

/** Fila horizontal de ProductCard con título, "Ver todo" y flechas (en móvil se desliza con el dedo). */
export default function CarruselProductos({ titulo, productos, href, className = "" }: Props) {
  const fila = useRef<HTMLUListElement>(null);

  const desplazar = (direccion: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (productos.length === 0) return null;

  return (
    <section className={className} aria-label={titulo}>
      <TituloSeccion
        titulo={titulo}
        href={href}
        acciones={
          <>
            <button type="button" onClick={() => desplazar(-1)} className={claseFlecha} aria-label="Anteriores">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => desplazar(1)} className={claseFlecha} aria-label="Siguientes">
              <ChevronRight className="size-4" />
            </button>
          </>
        }
      />
      <ul
        ref={fila}
        className="sin-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 md:mx-0 md:scroll-px-0 md:gap-4 md:px-0"
      >
        {productos.map((producto) => (
          <li
            key={producto.id}
            className="shrink-0 basis-[46%] snap-start md:basis-[calc((100%-2*1rem)/3)] lg:basis-[calc((100%-4*1rem)/5)]"
          >
            <ProductCard producto={producto} />
          </li>
        ))}
      </ul>
    </section>
  );
}
