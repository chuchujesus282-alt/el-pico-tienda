import Link from "next/link";
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
      <legend className="mb-2 text-sm font-bold text-pico-azul">{titulo}</legend>
      <ul className="space-y-1">
        {opciones.map((opcion) => (
          <li key={opcion.etiqueta}>
            <Link
              href={opcion.href}
              scroll={false}
              aria-current={opcion.activa ? "true" : undefined}
              className={`block rounded-boton px-3 py-2 text-sm transition-colors ${
                opcion.activa
                  ? "bg-pico-azul-claro font-semibold text-pico-azul"
                  : "text-texto hover:bg-gris-fondo hover:text-pico-azul"
              }`}
            >
              {opcion.etiqueta}
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
          className="inline-block text-sm font-semibold text-pico-rojo hover:underline"
        >
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}
