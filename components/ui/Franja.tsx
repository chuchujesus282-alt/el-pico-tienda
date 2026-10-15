import type { ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "./Contenedor";

type Props = {
  /** Fondo de la franja, de borde a borde de la pantalla. */
  tono?: "gris" | "blanco";
  /** Clases del contenedor interior (ej. espaciados entre bloques). */
  className?: string;
  /** Franja más baja, para piezas cortas (una fila de círculos, una nota). */
  compacta?: boolean;
  /**
   * Detalle decorativo de fondo, muy tenue: las montañas del logo en una esquina y un velo azul claro.
   * Solo para franjas blancas con poco contenido (accesos, banners); no usar detrás de carruseles de productos.
   */
  decorada?: "derecha" | "izquierda";
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
export default function Franja({ tono = "gris", className = "", compacta = false, decorada, children }: Props) {
  return (
    <section className={`${fondos[tono]} ${decorada ? "relative isolate overflow-hidden" : ""}`}>
      {decorada && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 -z-10 w-2/3 from-pico-azul-claro/70 to-transparent ${
              decorada === "derecha" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
            }`}
            aria-hidden
          />
          <Montanas
            className={`pointer-events-none absolute -bottom-10 -z-10 w-72 fill-pico-azul/[0.05] motion-safe:animate-deriva md:w-[28rem] ${
              decorada === "derecha" ? "-right-10" : "-left-10 -scale-x-100"
            }`}
          />
        </>
      )}
      <Contenedor className={`${compacta ? "py-6 md:py-8" : "py-8 md:py-12"} ${className}`}>{children}</Contenedor>
    </section>
  );
}
