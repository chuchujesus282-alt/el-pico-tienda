import Link from "next/link";
import { Check, RotateCcw } from "lucide-react";
import { type EstadoCategoria, hrefCategoria } from "./rutas";

type Props = {
  slug: string;
  estado: EstadoCategoria;
  subcategorias: string[];
  marcas: string[];
};

type Opcion = { etiqueta: string; href: string; activa: boolean };

function GrupoFiltro({ titulo, opciones }: { titulo: string; opciones: Opcion[] }) {
  return (
    <fieldset>
      <legend className="mb-2 font-titulo text-xs font-bold tracking-[0.18em] text-logo-marino uppercase">{titulo}</legend>
      <ul className="space-y-1">
        {opciones.map((opcion) => (
          <li key={opcion.etiqueta}>
            <Link
              href={opcion.href}
              scroll={false}
              aria-current={opcion.activa ? "true" : undefined}
              className={`group relative flex items-center gap-2 overflow-hidden rounded-boton py-2 pr-3 pl-4 text-sm transition duration-200 ${
                opcion.activa
                  ? "bg-logo-marino-claro font-semibold text-logo-marino"
                  : "text-texto hover:bg-gris-fondo hover:text-logo-marino"
              }`}
            >
              <span
                className={`absolute inset-y-1.5 left-0 w-1 rounded-chip bg-logo-rojo transition-transform duration-200 ${
                  opcion.activa ? "scale-y-100" : "scale-y-0 group-hover:scale-y-50"
                }`}
                aria-hidden
              />
              <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">{opcion.etiqueta}</span>
              {opcion.activa && <Check className="ml-auto size-4 shrink-0 motion-safe:animate-latido" aria-hidden />}
            </Link>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/** Filtros de subcategoría y marca. Se usan en la barra lateral (escritorio) y en el panel "Filtrar" (móvil). */
export default function FiltrosCategoria({ slug, estado, subcategorias, marcas }: Props) {
  const hayFiltros = !!(estado.marca || estado.subcategoria);

  const opciones = (clave: "subcategoria" | "marca", valores: string[], todas: string): Opcion[] => [
    { etiqueta: todas, href: hrefCategoria(slug, estado, { [clave]: undefined }), activa: !estado[clave] },
    ...valores.map((valor) => ({
      etiqueta: valor,
      href: hrefCategoria(slug, estado, { [clave]: valor }),
      activa: estado[clave] === valor,
    })),
  ];

  return (
    <div className="space-y-6">
      {subcategorias.length > 0 && (
        <GrupoFiltro titulo="Subcategoría" opciones={opciones("subcategoria", subcategorias, "Todas")} />
      )}
      {marcas.length > 0 && <GrupoFiltro titulo="Marca" opciones={opciones("marca", marcas, "Todas las marcas")} />}
      {hayFiltros && (
        <Link
          href={hrefCategoria(slug, estado, { marca: undefined, subcategoria: undefined })}
          scroll={false}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-logo-rojo hover:underline"
        >
          <RotateCcw className="size-3.5 transition-transform duration-300 motion-safe:group-hover:-rotate-180" aria-hidden />
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}
