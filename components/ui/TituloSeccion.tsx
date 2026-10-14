import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  /** Enlace "Ver todo" a la derecha. Si no se pasa, no se muestra. */
  href?: string;
  textoEnlace?: string;
  /** Contenido extra a la derecha (ej. flechas de un carrusel). */
  acciones?: ReactNode;
  /** Usa "h1" cuando es el título principal de la página. */
  nivel?: "h1" | "h2";
  /** El título va sobre una franja azul marino: texto y enlace en blanco. */
  sobreAzul?: boolean;
  className?: string;
};

/** Título de sección con la marca roja del rebranding a la izquierda y "Ver todo" a la derecha. */
export default function TituloSeccion({
  titulo,
  href,
  textoEnlace = "Ver todo",
  acciones,
  nivel: Etiqueta = "h2",
  sobreAzul = false,
  className = "",
}: Props) {
  return (
    <div className={`mb-4 flex items-center justify-between gap-4 ${className}`}>
      <Etiqueta className={`flex items-center gap-2.5 text-xl font-bold md:text-2xl ${sobreAzul ? "text-pico-blanco" : "text-pico-azul"}`}>
        <span className="h-6 w-1.5 shrink-0 -skew-x-12 rounded-sm bg-pico-rojo md:h-7" aria-hidden />
        {titulo}
      </Etiqueta>
      {(href || acciones) && (
        <div className="flex shrink-0 items-center gap-3">
          {href && (
            <Link
              href={href}
              className={`group inline-flex items-center gap-1 text-sm font-semibold hover:underline ${sobreAzul ? "text-pico-blanco" : "text-pico-rojo"}`}
            >
              {textoEnlace}
              <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
          {acciones}
        </div>
      )}
    </div>
  );
}
