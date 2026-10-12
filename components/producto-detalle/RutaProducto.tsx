import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import type { Categoria } from "@/types/catalogo";

type Props = {
  categoria: Categoria | null;
  /** En subpáginas del producto (ej. opiniones): enlace al producto antes de la página actual. */
  producto?: { titulo: string; href: string };
  actual: string;
};

/** Inicio › Categoría › Producto (› Subpágina). */
export default function RutaProducto({ categoria, producto, actual }: Props) {
  const separador = (
    <li aria-hidden>
      <ChevronRight className="size-3.5" />
    </li>
  );

  return (
    <nav aria-label="Ruta de navegación" className="text-[13px] text-gris-texto">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-logo-marino hover:underline">
            <House className="size-3.5" aria-hidden />
            Inicio
          </Link>
        </li>
        {categoria && (
          <>
            {separador}
            <li>
              <Link href={`/categoria/${categoria.slug}`} className="hover:text-logo-marino hover:underline">
                {categoria.nombre}
              </Link>
            </li>
          </>
        )}
        {producto && (
          <>
            {separador}
            <li className="min-w-0">
              <Link href={producto.href} className="line-clamp-1 hover:text-logo-marino hover:underline">
                {producto.titulo}
              </Link>
            </li>
          </>
        )}
        {separador}
        <li aria-current="page" className="line-clamp-1 font-medium text-texto">
          {actual}
        </li>
      </ol>
    </nav>
  );
}
