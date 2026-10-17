import type { ReactNode } from "react";

export type PropsIcono = {
  className?: string;
  /** Texto para lectores de pantalla. Sin él, el ícono es decorativo (aria-hidden). */
  titulo?: string;
};

/**
 * Base de los íconos propios de El Pico: grilla de 32×32, trazo de 1.75 en currentColor con puntas y
 * uniones redondeadas, y un solo acento en rojo (clases .ac-* de globals.css). Las piezas con clase .ia-*
 * se animan al pasar el mouse sobre un .grupo-icono o al quedar elegidas ([data-icono-activo="true"]).
 */
export default function IconoBase({ className = "size-7", titulo, children }: PropsIcono & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icono-pico shrink-0 ${className}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {children}
    </svg>
  );
}
