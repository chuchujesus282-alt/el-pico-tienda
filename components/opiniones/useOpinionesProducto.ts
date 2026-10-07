"use client";

import { useMemo, useSyncExternalStore } from "react";
import { resumirOpiniones } from "@/lib/resumirOpiniones";
import type { Opinion } from "@/types/opiniones";
import { obtenerOpiniones, obtenerOpinionesServidor, suscribir } from "./almacenOpiniones";

/** Opiniones del producto (las del servidor + las que escribió el cliente en este navegador) y su resumen. */
export function useOpinionesProducto(productoId: string, delServidor: Opinion[]) {
  const guardadas = useSyncExternalStore(suscribir, obtenerOpiniones, obtenerOpinionesServidor);

  return useMemo(() => {
    const propias = guardadas.filter((o) => o.productoId === productoId);
    const todas = [...propias, ...delServidor];
    return {
      opiniones: todas,
      propias: new Set(propias.map((o) => o.id)),
      resumen: resumirOpiniones(todas),
    };
  }, [guardadas, productoId, delServidor]);
}
