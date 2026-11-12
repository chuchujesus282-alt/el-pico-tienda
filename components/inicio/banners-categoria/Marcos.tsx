import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { categorias } from "@/lib/categorias";
import { textosCategoria } from "../contenidoInicio";

// Marcos de los banners PEQUEÑOS de categoría del inicio (persona B, 2026-11-11): horizontales (fila de dos) y
// columnas verticales (fila de cuatro). El marco pone el enlace, el texto y el botón con el estilo de los demás
// banners; cada categoría pone su escena con fotos reales (Horizontales.tsx y Verticales.tsx). Así cada uno se ve
// distinto, pero todos se leen igual.

function nombreDe(slug: string): string {
  return categorias.find((c) => c.slug === slug)?.nombre ?? slug;
}

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

type PropsHorizontal = {
  slug: string;
  /** "oscuro": letra blanca y botón blanco; "claro": letra azul y botón azul. */
  tono: "oscuro" | "claro";
  /** Clases del fondo del banner. */
  fondo: string;
  /** Escena decorativa (se dibuja detrás del texto, sin eventos). */
  escena: ReactNode;
};

/** Banner horizontal: texto a la izquierda (58 % del ancho como máximo), escena a la derecha. */
export function MarcoHorizontal({ slug, tono, fondo, escena }: PropsHorizontal) {
  const textos = textosCategoria[slug];
  const oscuro = tono === "oscuro";
  return (
    <Link
      href={`/categoria/${slug}`}
      className={`group relative flex h-full min-h-48 overflow-hidden rounded-banner shadow-tarjeta transition duration-200 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 md:min-h-60 ${FOCO} ${fondo}`}
    >
      <span className="pointer-events-none absolute inset-0" aria-hidden>
        {escena}
      </span>
      <span className="relative flex max-w-[58%] flex-col justify-center gap-2 p-5 md:gap-3 md:p-8">
        <span
          className="h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-14 lg:w-12 lg:group-hover:w-16"
          aria-hidden
        />
        <span className={`text-2xl leading-tight font-bold md:text-3xl ${oscuro ? "text-pico-blanco" : "text-pico-azul"}`}>
          {nombreDe(slug)}
        </span>
        {textos?.texto && (
          <span className={`text-sm leading-snug md:text-base ${oscuro ? "text-pico-blanco/80" : "text-gris-texto"}`}>
            {textos.texto}
          </span>
        )}
        <span
          className={`mt-1 inline-flex h-10 w-fit items-center gap-1 rounded-boton whitespace-nowrap px-4 text-sm font-semibold shadow-tarjeta transition duration-200 group-hover:shadow-boton-hover motion-safe:group-hover:-translate-y-0.5 md:mt-2 md:h-12 md:px-6 md:text-base ${
            oscuro
              ? "bg-pico-blanco text-pico-azul group-hover:bg-pico-azul-claro"
              : "bg-pico-azul text-pico-blanco group-hover:bg-pico-azul-oscuro"
          }`}
        >
          {textos?.textoBoton ?? "Ver categoría"}
          <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

type PropsVertical = {
  slug: string;
  /** Clases del fondo de la columna. */
  fondo: string;
  /** Escena decorativa de arriba (la de abajo la tapa el velo del texto). */
  escena: ReactNode;
};

/** Columna vertical de 320:470, con el mismo bloque de texto que ColumnaCategoria y las tarjetas animadas. */
export function MarcoVertical({ slug, fondo, escena }: PropsVertical) {
  const textos = textosCategoria[slug];
  return (
    <Link
      href={`/categoria/${slug}`}
      className={`group relative flex aspect-[320/470] flex-col justify-end overflow-hidden rounded-banner shadow-tarjeta transition duration-300 ease-(--curva-suave) hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 ${FOCO} ${fondo}`}
    >
      <span className="pointer-events-none absolute inset-0" aria-hidden>
        {escena}
      </span>
      {/* Velo para que el texto siempre se lea. */}
      <span
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-pico-azul-oscuro via-pico-azul-oscuro/85 to-transparent"
        aria-hidden
      />
      <span className="relative flex flex-col gap-1.5 p-4 md:gap-2 md:p-5 lg:p-6">
        <span className="h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-14" aria-hidden />
        <span className="text-lg leading-tight font-bold text-pico-blanco md:text-xl lg:text-2xl">{nombreDe(slug)}</span>
        {/* Siempre dos líneas de alto, como las demás columnas: los nombres de las cuatro quedan alineados. */}
        <span className="hidden min-h-[2.75em] text-sm leading-snug text-pico-blanco/75 sm:block">{textos?.texto}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-pico-blanco">
          Ver categoría
          <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
