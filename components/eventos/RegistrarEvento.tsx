"use client";

import { useEffect } from "react";
import { registrarEvento } from "@/lib/eventos/cliente";
import type { Evento } from "@/lib/eventos/reglas";

/**
 * Registra un evento para análisis al mostrarse (no dibuja nada; ver lib/eventos/cliente.ts). Ej.:
 * página de producto → <RegistrarEvento evento={{ tipo: "producto_visto", producto: producto.id }} />
 * página de búsqueda → <RegistrarEvento evento={{ tipo: "busqueda", termino: q, resultados: 12 }} />
 */
export default function RegistrarEvento({ evento }: { evento: Evento }) {
  const clave = JSON.stringify(evento);
  useEffect(() => {
    registrarEvento(JSON.parse(clave) as Evento);
  }, [clave]);
  return null;
}
