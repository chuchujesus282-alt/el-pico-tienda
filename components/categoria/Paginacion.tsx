import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type EstadoCategoria, hrefCategoria } from "./rutas";

type Props = {
  slug: string;
  estado: EstadoCategoria;
  totalPaginas: number;
};

/** Números a mostrar: primera, última y vecinas de la actual; "…" para los huecos. */
function paginasVisibles(actual: number, total: number): (number | "…")[] {
  const numeros = [...new Set([1, actual - 1, actual, actual + 1, total])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  return numeros.flatMap((n, i) => (i > 0 && n - numeros[i - 1] > 1 ? ["…" as const, n] : [n]));
}

const base =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-boton px-3 text-sm font-semibold transition-colors";

export default function Paginacion({ slug, estado, totalPaginas }: Props) {
  if (totalPaginas <= 1) return null;
  const actual = Math.min(estado.pagina, totalPaginas);
  const enlace = (pagina: number) => hrefCategoria(slug, estado, { pagina });

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-2">
      {actual > 1 && (
        <Link href={enlace(actual - 1)} className={`${base} text-pico-azul hover:bg-pico-azul-claro`}>
          <ChevronLeft className="size-4" aria-hidden />
          <span className="hidden sm:inline">Anterior</span>
          <span className="sr-only sm:hidden">Página anterior</span>
        </Link>
      )}
      {paginasVisibles(actual, totalPaginas).map((pagina, i) =>
        pagina === "…" ? (
          <span key={`hueco-${i}`} className="px-1 text-gris-texto" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={pagina}
            href={enlace(pagina)}
            aria-current={pagina === actual ? "page" : undefined}
            aria-label={`Página ${pagina}`}
            className={`${base} ${
              pagina === actual
                ? "bg-pico-azul text-pico-blanco"
                : "border border-gris-borde bg-pico-blanco text-pico-azul hover:bg-pico-azul-claro"
            }`}
          >
            {pagina}
          </Link>
        ),
      )}
      {actual < totalPaginas && (
        <Link href={enlace(actual + 1)} className={`${base} text-pico-azul hover:bg-pico-azul-claro`}>
          <span className="hidden sm:inline">Siguiente</span>
          <span className="sr-only sm:hidden">Página siguiente</span>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
