import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Precio from "@/components/ui/Precio";
import { formatearBs, formatearFecha } from "@/lib/formato";
import type { ResumenPedido } from "@/lib/pedidos/servidor";

/** Filas de "Mis pedidos": fecha (Caracas), cuántos productos, total en $ y Bs; cada una lleva al detalle. */
export default function ListaPedidos({ pedidos }: { pedidos: ResumenPedido[] }) {
  return (
    <ul className="divide-y divide-gris-borde overflow-hidden rounded-tarjeta border border-gris-borde">
      {pedidos.map((p) => (
        <li key={p.id}>
          <Link
            href={`/mi-cuenta/pedidos/${p.id}`}
            className="group flex items-center gap-4 bg-pico-blanco px-4 py-3.5 transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul sm:px-5"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-pico-azul first-letter:uppercase">{formatearFecha(p.fecha)}</span>
              <span className="block text-sm text-gris-texto">
                {p.productos} {p.productos === 1 ? "producto" : "productos"}
                {p.unidades !== p.productos && ` · ${p.unidades} unidades`}
              </span>
            </span>
            <span className="text-right">
              <Precio valor={p.totalUsd} className="block text-base tabular-nums" />
              {p.totalBs !== null && <span className="block text-xs text-gris-texto tabular-nums">{formatearBs(p.totalBs)}</span>}
            </span>
            <ChevronRight className="size-5 shrink-0 text-gris-texto transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
