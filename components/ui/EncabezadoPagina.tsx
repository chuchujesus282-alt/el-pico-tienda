import Image from "next/image";
import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Contenedor from "./Contenedor";

export type Miga = { texto: string; href?: string };

type Props = {
  /** Título de la página (h1). Sin título, la franja queda delgada y solo muestra la ruta. */
  titulo?: string;
  /** Texto pequeño sobre el título (ej. "Categoría"). */
  etiqueta?: string;
  descripcion?: ReactNode;
  /** Ruta de navegación después de "Inicio". El último elemento es la página actual. */
  ruta?: Miga[];
  /** Ícono grande y tenue a la derecha, como en los banners. */
  icono?: LucideIcon;
  /** Imagen de fondo opcional (ej. banner de la categoría). */
  imagen?: string | null;
  /** Contenido extra bajo el título (ej. cantidad de productos, pasos). */
  children?: ReactNode;
};

/**
 * Encabezado de página: franja azul marino de borde a borde, con la ruta de navegación, el acento
 * rojo corto y el título. Lo usan todas las páginas interiores para que el sitio se vea parejo.
 */
export default function EncabezadoPagina({ titulo, etiqueta, descripcion, ruta, icono: Icono, imagen, children }: Props) {
  return (
    <header className="relative isolate overflow-hidden border-t border-pico-blanco/10 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro text-pico-blanco print:border-0 print:bg-none print:text-texto">
      {imagen && (
        <>
          <Image src={imagen} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pico-azul-oscuro/90 via-pico-azul/70 to-pico-azul/20" />
        </>
      )}
      {Icono && !imagen && (
        <span className="pointer-events-none absolute right-[max(1rem,6vw)] -bottom-10 -z-10 hidden motion-safe:animate-flotar sm:block print:hidden" aria-hidden>
          <Icono className="size-44 text-pico-blanco/10 md:size-64" strokeWidth={1.25} />
        </span>
      )}

      <Contenedor className={titulo ? "py-5 md:py-8" : "py-3"}>
        {ruta && (
          <nav aria-label="Ruta de navegación" className="text-[13px] text-pico-blanco/70 print:hidden">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 rounded-sm transition-colors hover:text-pico-blanco hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
                >
                  <House className="size-3.5" aria-hidden />
                  Inicio
                </Link>
              </li>
              {ruta.map((miga, i) => (
                <li key={`${miga.texto}-${i}`} className="flex min-w-0 items-center gap-1" aria-current={i === ruta.length - 1 ? "page" : undefined}>
                  <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                  {miga.href && i < ruta.length - 1 ? (
                    <Link
                      href={miga.href}
                      className="rounded-sm transition-colors hover:text-pico-blanco hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
                    >
                      {miga.texto}
                    </Link>
                  ) : (
                    <span className="line-clamp-1 font-medium text-pico-blanco">{miga.texto}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {titulo && (
          <div className={`motion-safe:animate-aparecer ${ruta ? "mt-4 md:mt-5" : ""}`}>
            <span className="block h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo lg:w-14 print:hidden" aria-hidden />
            {etiqueta && <span className="mt-3 block text-xs font-semibold tracking-[0.25em] text-pico-blanco/70 uppercase">{etiqueta}</span>}
            <h1 className={`max-w-4xl text-3xl leading-tight font-bold text-balance md:text-5xl ${etiqueta ? "mt-1" : "mt-3"}`}>{titulo}</h1>
            {descripcion && <p className="mt-2 max-w-2xl text-sm text-pico-blanco/80 md:text-base print:text-gris-texto">{descripcion}</p>}
            {children && <div className="mt-4">{children}</div>}
          </div>
        )}
      </Contenedor>
    </header>
  );
}
