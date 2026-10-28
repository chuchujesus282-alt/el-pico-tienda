import type { ReactNode } from "react";

type Props = {
  icono: ReactNode;
  titulo: string;
  className?: string;
  /** "oscuro": azul marino con texto blanco, para destacar una de las tarjetas. Por defecto, blanca. */
  tono?: "claro" | "oscuro";
  children: ReactNode;
};

/** Tarjeta blanca con ícono en círculo y título, para páginas informativas (ej. Ubícanos). */
export default function TarjetaInfo({ icono, titulo, className = "", tono = "claro", children }: Props) {
  const oscuro = tono === "oscuro";
  return (
    <section
      className={`flex flex-col gap-3 rounded-tarjeta p-5 md:p-6 ${
        oscuro
          ? "bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco shadow-tarjeta-hover"
          : "border border-gris-borde bg-pico-blanco shadow-tarjeta"
      } ${className}`}
    >
      <h2 className={`flex items-center gap-3 text-lg font-bold ${oscuro ? "text-pico-blanco" : "text-pico-azul"}`}>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-chip ${oscuro ? "bg-pico-blanco/10 text-pico-blanco ring-1 ring-pico-blanco/15" : "bg-pico-azul-claro text-pico-rojo"}`}
        >
          {icono}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}
