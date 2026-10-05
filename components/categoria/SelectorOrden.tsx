"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { OrdenProductos } from "@/types/catalogo";

type Props = {
  actual: OrdenProductos;
  /** Cada opción trae su enlace ya armado (con los filtros actuales). */
  opciones: { valor: OrdenProductos; etiqueta: string; href: string }[];
};

/** "Ordenar por": relevancia, precio menor, precio mayor, nombre. */
export default function SelectorOrden({ actual, opciones }: Props) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-gris-texto sm:inline">Ordenar por</span>
      <span className="relative">
        <select
          value={actual}
          onChange={(e) => {
            const opcion = opciones.find((o) => o.valor === e.target.value);
            if (opcion) router.push(opcion.href, { scroll: false });
          }}
          aria-label="Ordenar por"
          className="h-10 cursor-pointer appearance-none rounded-boton border border-gris-borde bg-pico-blanco pr-9 pl-3 font-medium text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
        >
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gris-texto"
          aria-hidden
        />
      </span>
    </label>
  );
}
