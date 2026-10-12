import type { ReactNode } from "react";
import { Star } from "lucide-react";
import type { ResumenOpiniones } from "@/types/opiniones";
import Estrellas from "./Estrellas";

type Props = {
  resumen: ResumenOpiniones;
  /** Contenido extra a la derecha del encabezado (ej. enlace a todas las opiniones). */
  acciones?: ReactNode;
  className?: string;
};

/** Promedio grande + barras por cantidad de estrellas. */
export default function SeccionCalificaciones({ resumen, acciones, className = "" }: Props) {
  return (
    <section
      id="calificaciones"
      aria-labelledby="titulo-calificaciones"
      className={`scroll-mt-6 rounded-banner border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-8 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="titulo-calificaciones" className="font-titulo text-xl font-bold text-logo-marino md:text-2xl">
          Calificaciones
        </h2>
        {acciones}
      </div>

      {resumen.total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Estrellas valor={0} className="size-7" />
          <p className="font-titulo text-lg font-semibold text-logo-marino">Este producto aún no tiene opiniones</p>
          <p className="text-[13px] text-gris-texto">Cuando lo compres, cuéntanos qué te pareció.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[14rem_1fr] md:gap-10">
          <div className="flex flex-col items-center justify-center gap-1 rounded-tarjeta bg-logo-marino-claro p-5 text-center">
            <span className="font-titulo text-5xl leading-none font-bold text-logo-marino">
              {resumen.promedio.toLocaleString("es-VE", { minimumFractionDigits: 1 })}
            </span>
            <Estrellas valor={resumen.promedio} className="size-5" />
            <span className="text-[13px] text-gris-texto">
              {resumen.total} {resumen.total === 1 ? "opinión" : "opiniones"}
            </span>
          </div>

          <ul className="flex flex-col justify-center gap-2">
            {resumen.porEstrellas.map((cantidad, i) => {
              const estrellas = 5 - i;
              const porcentaje = Math.round((cantidad / resumen.total) * 100);
              return (
                <li key={estrellas} className="flex items-center gap-3 text-sm">
                  <span className="flex w-8 shrink-0 items-center gap-1 font-semibold text-logo-marino tabular-nums">
                    {estrellas}
                    <Star className="size-3.5 fill-estrella text-estrella" aria-hidden />
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-chip bg-gris-fondo">
                    <span
                      className="block h-full rounded-chip bg-estrella transition-[width] duration-700"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-[13px] text-gris-texto tabular-nums">{porcentaje}%</span>
                  <span className="sr-only">
                    {cantidad} {cantidad === 1 ? "opinión" : "opiniones"} de {estrellas} estrellas
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
