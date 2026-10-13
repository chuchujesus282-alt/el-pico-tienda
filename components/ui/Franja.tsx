import type { ReactNode } from "react";
import Contenedor from "./Contenedor";

type Props = {
  /** Fondo de la franja, de borde a borde de la pantalla. */
  tono?: "gris" | "blanco";
  /** Clases del contenedor interior (ej. espaciados entre bloques). */
  className?: string;
  /** Franja más baja, para piezas cortas (una fila de círculos, una nota). */
  compacta?: boolean;
  children: ReactNode;
};

const fondos = {
  gris: "bg-gris-fondo",
  blanco: "border-y border-gris-borde bg-pico-blanco",
};

/**
 * Franja a todo el ancho de la pantalla con su contenido dentro del Contenedor centrado.
 * Las páginas se arman apilando franjas que alternan gris y blanco, para que se lean como bandas
 * horizontales y no como una columna en el centro. No usa 100vw: no provoca scroll horizontal.
 */
export default function Franja({ tono = "gris", className = "", compacta = false, children }: Props) {
  return (
    <section className={fondos[tono]}>
      <Contenedor className={`${compacta ? "py-6 md:py-8" : "py-8 md:py-12"} ${className}`}>{children}</Contenedor>
    </section>
  );
}
