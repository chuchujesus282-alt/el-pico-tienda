import type { ReactNode } from "react";

type Props = {
  icono: ReactNode;
  titulo: string;
  /** Contenido extra junto al título (ej. un Badge "Hoy"). */
  extra?: ReactNode;
  /** Resalta la tarjeta con borde azul (ej. el horario que aplica hoy). */
  destacada?: boolean;
  className?: string;
  children: ReactNode;
};

/** Tarjeta blanca con ícono en círculo y título, para páginas informativas (Ubícanos, Horario). */
export default function TarjetaInfo({ icono, titulo, extra, destacada = false, className = "", children }: Props) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-tarjeta border bg-pico-blanco p-5 shadow-tarjeta transition-colors md:p-6 ${
        destacada ? "border-pico-azul ring-1 ring-pico-azul" : "border-gris-borde"
      } ${className}`}
    >
      <h2 className="flex items-center gap-3 text-lg font-bold text-pico-azul">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-rojo">{icono}</span>
        {titulo}
        {extra && <span className="ml-auto">{extra}</span>}
      </h2>
      {children}
    </section>
  );
}
