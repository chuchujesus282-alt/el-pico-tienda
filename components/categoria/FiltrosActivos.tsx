import Link from "next/link";
import { X } from "lucide-react";
import { type EstadoCategoria, hrefCategoria } from "./rutas";

type Props = {
  slug: string;
  estado: EstadoCategoria;
};

/** Chips de los filtros puestos, cada uno con su ✕ para quitarlo. */
export default function FiltrosActivos({ slug, estado }: Props) {
  const chips = [
    estado.subcategoria && { etiqueta: estado.subcategoria, href: hrefCategoria(slug, estado, { subcategoria: undefined }) },
    estado.marca && { etiqueta: estado.marca, href: hrefCategoria(slug, estado, { marca: undefined }) },
  ].filter((c): c is { etiqueta: string; href: string } => !!c);

  if (chips.length === 0) return null;

  return (
    <ul className="mb-4 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
      {chips.map((chip) => (
        <li key={chip.etiqueta} className="motion-safe:animate-aparecer">
          <Link
            href={chip.href}
            scroll={false}
            className="group inline-flex h-8 items-center gap-1.5 rounded-chip bg-logo-marino pr-2 pl-3 text-xs font-semibold text-pico-blanco transition-colors hover:bg-logo-rojo"
            aria-label={`Quitar filtro ${chip.etiqueta}`}
          >
            {chip.etiqueta}
            <span className="flex size-4 items-center justify-center rounded-chip bg-pico-blanco/20 transition-transform duration-200 motion-safe:group-hover:rotate-90">
              <X className="size-3" strokeWidth={3} aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
