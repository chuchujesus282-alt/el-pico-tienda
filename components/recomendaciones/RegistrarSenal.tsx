"use client";

import { useEffect } from "react";
import { registrarSenales } from "@/lib/recomendaciones/almacenPerfil";
import type { Senal } from "@/lib/recomendaciones/tipos";

/**
 * Anota señales en el perfil del cliente al mostrarse (no dibuja nada). Ej.:
 * página de producto → <RegistrarSenal senales={[{ tipo: "visto", id: producto.id }]} />
 * página de búsqueda → <RegistrarSenal senales={[{ tipo: "busqueda", termino: q }]} />
 */
export default function RegistrarSenal({ senales }: { senales: Omit<Senal, "fecha">[] }) {
  const clave = JSON.stringify(senales);
  useEffect(() => {
    registrarSenales(JSON.parse(clave) as Omit<Senal, "fecha">[]);
  }, [clave]);
  return null;
}
