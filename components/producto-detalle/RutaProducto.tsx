import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import type { Categoria } from "@/types/catalogo";

type Props = {
  categoria: Categoria | null;
  actual: string;
};

/** Inicio â€º CategorÃ­a â€º Producto. */
export default function RutaProducto({ categoria, actual }: Props) {
  const separador = (
    <li aria-hidden>
      <ChevronRight className="size-3.5" />
    </li>
  );

  return (
    <nav aria-label="Ruta de navegaciÃ³n" className="text-[13px] text-gris-texto">
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
        {separador}
        <li aria-current="page" className="line-clamp-1 font-medium text-texto">
          {actual}
        </li>
      </ol>
    </nav>
  );
}
