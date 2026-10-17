import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Elegida: azul marino con el ícono en blanco (el acento sigue rojo) y un pequeño "pop". */
  activo?: boolean;
  tamano?: "sm" | "md" | "lg";
  /** "claro" sobre fondo blanco; "oscuro" para placas que van sobre fotos (calculadoras). */
  tono?: "claro" | "oscuro";
  className?: string;
};

const TAMANOS = {
  sm: "size-9 rounded-[10px] [&_.icono-pico]:size-6",
  md: "size-11 rounded-xl [&_.icono-pico]:size-7 sm:size-12 sm:[&_.icono-pico]:size-8",
  lg: "size-14 rounded-2xl [&_.icono-pico]:size-9",
};

/**
 * Placa de los íconos propios: azul claro, hundida apenas (borde interior y sombra interna). Al elegirse
 * pasa a azul marino. Es un .grupo-icono: las piezas animables del ícono se mueven al pasar el mouse.
 */
export default function PlacaIcono({ children, activo = false, tamano = "md", tono = "claro", className = "" }: Props) {
  const estado = activo
    ? "bg-pico-azul text-pico-blanco ring-pico-azul shadow-boton-hover [--icono-fondo:var(--color-pico-azul)]"
    : tono === "oscuro"
      ? "bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco ring-pico-blanco/15 shadow-tarjeta [--icono-fondo:var(--color-pico-azul)]"
      : "bg-pico-azul-claro text-pico-azul ring-pico-azul/10 shadow-placa [--icono-fondo:var(--color-pico-azul-claro)]";
  return (
    <span
      data-icono-activo={activo ? "true" : undefined}
      className={`grupo-icono relative inline-flex shrink-0 items-center justify-center ring-1 ring-inset transition duration-300 ease-(--curva-suave) ${TAMANOS[tamano]} ${estado} ${className}`}
    >
      <span key={activo ? "si" : "no"} className={`flex ${activo ? "motion-safe:animate-pop" : ""}`}>
        {children}
      </span>
    </span>
  );
}
