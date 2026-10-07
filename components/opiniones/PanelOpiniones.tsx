"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import SeccionCalificaciones from "@/components/producto-detalle/SeccionCalificaciones";
import type { Opinion } from "@/types/opiniones";
import FormularioOpinion from "./FormularioOpinion";
import ListaOpiniones from "./ListaOpiniones";
import { useOpinionesProducto } from "./useOpinionesProducto";

type Props = {
  productoId: string;
  opiniones: Opinion[];
};

/** Página de opiniones: resumen + lista (izquierda) y formulario para escribir (derecha, fijo en escritorio). */
export default function PanelOpiniones({ productoId, opiniones: delServidor }: Props) {
  const { opiniones, propias, resumen } = useOpinionesProducto(productoId, delServidor);
  const [resaltada, setResaltada] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <SeccionCalificaciones
          resumen={resumen}
          acciones={
            <a
              href="#escribir"
              className="group inline-flex h-10 items-center gap-2 rounded-boton bg-logo-marino px-4 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-logo-marino-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5 lg:hidden"
            >
              <MessageSquarePlus className="size-4" aria-hidden />
              Escribir opinión
            </a>
          }
        />
        {/* Sin opiniones, el aviso de SeccionCalificaciones basta: no se repite con la lista vacía. */}
        {opiniones.length > 0 && (
          <ListaOpiniones key={resaltada ?? "lista"} opiniones={opiniones} propias={propias} resaltada={resaltada} />
        )}
      </div>
      <div className="lg:sticky lg:top-6">
        <FormularioOpinion productoId={productoId} alPublicar={setResaltada} />
      </div>
    </div>
  );
}
