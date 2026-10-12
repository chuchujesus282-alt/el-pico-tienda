"use client";

import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import ResumenEstrellas from "@/components/producto-detalle/ResumenEstrellas";
import SeccionCalificaciones from "@/components/producto-detalle/SeccionCalificaciones";
import type { Opinion } from "@/types/opiniones";
import { useOpinionesProducto } from "./useOpinionesProducto";

type Props = {
  productoId: string;
  opiniones: Opinion[];
};

const rutaOpiniones = (id: string) => `/producto/${encodeURIComponent(id)}/opiniones`;

/** Estrellas bajo el título; incluyen las opiniones que el cliente dejó en este navegador. Llevan a la página de opiniones. */
export function EstrellasProducto({ productoId, opiniones }: Props) {
  const { resumen } = useOpinionesProducto(productoId, opiniones);
  return <ResumenEstrellas resumen={resumen} href={rutaOpiniones(productoId)} />;
}

/** Sección "Calificaciones" de la página de producto, con accesos a ver y escribir opiniones. */
export function CalificacionesProducto({ productoId, opiniones, className }: Props & { className?: string }) {
  const { resumen } = useOpinionesProducto(productoId, opiniones);
  return (
    <SeccionCalificaciones
      resumen={resumen}
      className={className}
      acciones={
        <div className="flex flex-wrap items-center gap-2">
          {resumen.total > 0 && (
            <Link
              href={rutaOpiniones(productoId)}
              className="inline-flex h-10 items-center rounded-boton px-3 text-sm font-semibold text-logo-marino hover:bg-logo-marino-claro"
            >
              Ver las {resumen.total} opiniones
            </Link>
          )}
          <Link
            href={`${rutaOpiniones(productoId)}#escribir`}
            className="group inline-flex h-10 items-center gap-2 rounded-boton bg-logo-marino px-4 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-logo-marino-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5"
          >
            <MessageSquarePlus className="size-4 transition-transform motion-safe:group-hover:scale-110" aria-hidden />
            Escribir opinión
          </Link>
        </div>
      }
    />
  );
}
