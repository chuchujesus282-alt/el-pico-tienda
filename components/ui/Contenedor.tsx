import type { ReactNode } from "react";

type Props = {
  as?: "div" | "section" | "header" | "footer" | "nav";
  className?: string;
  children: ReactNode;
};

/**
 * Contenedor de TODO el sitio. El ancho máximo (`max-w-pagina`, 1760px con el margen incluido) y el margen lateral fluido
 * (`px-pagina`, entre 16 y 48px) se definen en un solo lugar: app/globals.css.
 */
export default function Contenedor({ as: Etiqueta = "div", className = "", children }: Props) {
  return <Etiqueta className={`mx-auto w-full max-w-pagina px-pagina ${className}`}>{children}</Etiqueta>;
}
