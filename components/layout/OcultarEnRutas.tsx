"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  /** Rutas donde NO se muestra el contenido (se compara el inicio de la ruta, ej. "/producto/"). */
  prefijos: string[];
  children: ReactNode;
};

/** Muestra su contenido en todas las páginas excepto en las rutas indicadas. */
export default function OcultarEnRutas({ prefijos, children }: Props) {
  const ruta = usePathname();
  if (prefijos.some((prefijo) => ruta.startsWith(prefijo))) return null;
  return children;
}
