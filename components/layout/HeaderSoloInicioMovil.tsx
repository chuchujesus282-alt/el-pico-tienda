"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RUTAS_CON_HEADER_MOVIL } from "./pantallaCompleta";

/**
 * En el teléfono (debajo de 768px) el header (logo, tasa, dirección y buscador) solo sale en Inicio y en los
 * resultados de búsqueda, como en las apps de tiendas: las demás pestañas empiezan directo con su encabezado.
 * Desde 768px sale siempre. `contents` no crea caja, así el `sticky` del header sigue funcionando.
 */
export default function HeaderSoloInicioMovil({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const visible = RUTAS_CON_HEADER_MOVIL.some((r) => (r === "/" ? ruta === "/" : ruta.startsWith(r)));
  return <div className={visible ? "contents" : "contents max-md:hidden"}>{children}</div>;
}
