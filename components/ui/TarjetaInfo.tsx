import type { ReactNode } from "react";

type Props = {
  icono: ReactNode;
  titulo: string;
  className?: string;
  children: ReactNode;
};

/** Tarjeta blanca con ícono en círculo y título, para páginas informativas (ej. Ubícanos). */
export default function TarjetaInfo({ icono, titulo, className = "", children }: Props) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-6 ${className}`}
    >
      <h2 className="flex items-center gap-3 text-lg font-bold text-pico-azul">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-rojo">{icono}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}
