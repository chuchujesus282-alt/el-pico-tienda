import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import Revelar from "./Revelar";

type Props = {
  titulo: string;
  /** Línea corta bajo el título, en gris (opcional). */
  subtitulo?: string;
  /** Enlace "Ver todo" a la derecha. Si no se pasa, no se muestra. */
  href?: string;
  textoEnlace?: string;
  /** Contenido extra a la derecha (ej. flechas de un carrusel). */
  acciones?: ReactNode;
  /** Usa "h1" cuando es el título principal de la página. */
  nivel?: "h1" | "h2";
  className?: string;
};

/** Título de sección con la marca roja del rebranding a la izquierda y "Ver todo" a la derecha. */
export default function TituloSeccion({
  titulo,
  subtitulo,
  href,
  textoEnlace = "Ver todo",
  acciones,
  nivel: Etiqueta = "h2",
  className = "",
}: Props) {
  return (
    // Al entrar en pantalla (Revelar), la barrita roja se dibuja primero y luego aparece el texto (globals.css).
    <Revelar className={`flex items-center justify-between gap-4 ${subtitulo ? "mb-5 md:mb-6" : "mb-4"} ${className}`}>
      <div className="min-w-0">
        <Etiqueta className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-pico-azul md:text-2xl">
          <span className="titulo-barra h-6 w-1.5 shrink-0 -skew-x-12 rounded-sm bg-pico-rojo md:h-7" aria-hidden />
          <span className="titulo-texto">{titulo}</span>
        </Etiqueta>
        {subtitulo && <p className="mt-1 pl-4 text-sm text-gris-texto">{subtitulo}</p>}
      </div>
      {(href || acciones) && (
        <div className="flex shrink-0 items-center gap-3">
          {href && (
            <Link
              href={href}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-pico-rojo hover:underline"
            >
              {textoEnlace}
              <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
          {acciones}
        </div>
      )}
    </Revelar>
  );
}
