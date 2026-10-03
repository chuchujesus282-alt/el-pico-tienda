import Link from "next/link";
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
  className?: string;
};

export default function TituloSeccion({
  titulo,
  href,
  textoEnlace = "Ver todo",
  acciones,
  nivel: Etiqueta = "h2",
  className = "",
}: Props) {
  return (
    <div className={`mb-4 flex items-center justify-between gap-4 ${className}`}>
      <Etiqueta className="text-xl font-bold text-pico-azul md:text-2xl">{titulo}</Etiqueta>
      {(href || acciones) && (
        <div className="flex shrink-0 items-center gap-3">
          {href && (
            <Link href={href} className="text-sm font-semibold text-pico-rojo hover:underline">
              {textoEnlace}
            </Link>
          )}
          {acciones}
        </div>
      )}
    </div>
  );
}
