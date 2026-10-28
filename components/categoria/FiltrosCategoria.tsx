import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, RotateCcw } from "lucide-react";
import type { NavegacionArbol } from "@/lib/arbolSaint";
import { type EstadoCategoria, hrefCategoria } from "./rutas";

type Props = {
  slug: string;
  estado: EstadoCategoria;
  /** Nombre de la categoría: primera parte de la ruta del árbol ("Construcción › …"). */
  nombreCategoria: string;
  /** Árbol de subcategorías de Saint en el nivel actual (lib/arbolSaint.ts). Sin él, la lista simple de abajo. */
  navegacion?: NavegacionArbol;
  subcategorias: string[];
  marcas: string[];
};

type Opcion = { etiqueta: string; href: string; activa: boolean; tieneHijas?: boolean };

/**
 * Una fila del panel: raya roja a la izquierda y ✓ en la elegida (diseño de persona B). Con hijas, una flecha "›" y el
 * enlace no cierra el panel del teléfono (data-sigue-abierto): se sigue bajando por el árbol.
 */
function Fila({ opcion }: { opcion: Opcion }) {
  return (
    <li>
      <Link
        href={opcion.href}
        scroll={false}
        aria-current={opcion.activa ? "true" : undefined}
        data-sigue-abierto={opcion.tieneHijas ? "" : undefined}
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
        <span className="min-w-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">{opcion.etiqueta}</span>
        {opcion.activa ? (
          <Check className="ml-auto size-4 shrink-0 motion-safe:animate-latido" aria-hidden />
        ) : (
          opcion.tieneHijas && (
            <ChevronRight
              className="ml-auto size-4 shrink-0 text-gris-texto transition-transform duration-200 group-hover:text-logo-marino motion-safe:group-hover:translate-x-0.5"
              aria-label="Tiene subcategorías"
            />
          )
        )}
      </Link>
    </li>
  );
}

function GrupoFiltro({ titulo, opciones, cabecera }: { titulo: string; opciones: Opcion[]; cabecera?: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-titulo text-xs font-bold tracking-[0.18em] text-logo-marino uppercase">{titulo}</legend>
      {cabecera}
      <ul className="space-y-1">
        {opciones.map((opcion) => (
          <Fila key={opcion.href} opcion={opcion} />
        ))}
      </ul>
    </fieldset>
  );
}

/**
 * Arriba del árbol, cuando se está en un nivel: "← Volver a [nivel de arriba]" y la ruta completa
 * ("Construcción › Materiales de construcción › Agua y tubería"), donde cada parte se puede tocar.
 */
function RutaArbol({ slug, estado, nombreCategoria, navegacion }: Required<Pick<Props, "slug" | "estado" | "nombreCategoria" | "navegacion">>) {
  const { ruta } = navegacion;
  const arriba = ruta.at(-2);
  const aNivel = (sub: number | undefined) => hrefCategoria(slug, estado, { sub, subcategoria: undefined });
  return (
    <div className="mb-3 space-y-2 border-b border-gris-borde pb-3">
      <Link
        href={aNivel(arriba?.codigo)}
        scroll={false}
        data-sigue-abierto=""
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-logo-rojo hover:underline"
      >
        <ArrowLeft className="size-4 shrink-0 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5" aria-hidden />
        Volver a {arriba?.nombre ?? "todas"}
      </Link>
      <nav aria-label="Ruta de subcategorías">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs leading-snug text-gris-texto">
          <li>
            <Link href={aNivel(undefined)} scroll={false} data-sigue-abierto="" className="area-tactil hover:text-logo-marino hover:underline">
              {nombreCategoria}
            </Link>
          </li>
          {ruta.map((parte, i) => (
            <li key={parte.codigo} className="flex items-center gap-x-1">
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              {i === ruta.length - 1 ? (
                <span aria-current="location" className="font-semibold text-logo-marino">
                  {parte.nombre}
                </span>
              ) : (
                <Link href={aNivel(parte.codigo)} scroll={false} data-sigue-abierto="" className="area-tactil hover:text-logo-marino hover:underline">
                  {parte.nombre}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/**
 * Filtros de subcategoría y marca. Se usan en la barra lateral (escritorio) y en el panel "Filtrar" (móvil).
 * Subcategorías: el árbol completo de Saint, un nivel a la vez. Al tocar una, se ven sus hijas (y la grilla muestra
 * lo de ese nivel y todo lo de abajo); en el último nivel se ven sus hermanas con la actual marcada. El nivel va en la
 * URL (?sub=código), así el "atrás" del navegador, los enlaces compartidos, la búsqueda, el orden y las páginas lo
 * respetan.
 */
export default function FiltrosCategoria({ slug, estado, nombreCategoria, navegacion, subcategorias, marcas }: Props) {
  const actual = navegacion?.actual ?? null;
  const hayFiltros = !!(estado.marca || actual || (!navegacion && estado.subcategoria));
  const aNivel = (sub: number | undefined) => hrefCategoria(slug, estado, { sub, subcategoria: undefined });

  let opcionesSub: Opcion[] = [];
  if (navegacion) {
    opcionesSub = [
      // Arriba de las hijas, el nivel actual completo (como "Todas" en el primer nivel). En el último nivel no hace falta:
      // la actual va marcada entre sus hermanas.
      ...(navegacion.sonHermanas
        ? []
        : [{ etiqueta: actual ? `Todo en ${actual.nombre}` : "Todas", href: aNivel(actual?.codigo), activa: true }]),
      ...navegacion.opciones.map((o) => ({
        etiqueta: o.nombre,
        href: aNivel(o.codigo),
        activa: navegacion.sonHermanas && o.codigo === actual?.codigo,
        tieneHijas: o.tieneHijas,
      })),
    ];
  } else if (subcategorias.length > 0) {
    opcionesSub = [
      { etiqueta: "Todas", href: hrefCategoria(slug, estado, { subcategoria: undefined }), activa: !estado.subcategoria },
      ...subcategorias.map((s) => ({
        etiqueta: s,
        href: hrefCategoria(slug, estado, { subcategoria: s }),
        activa: estado.subcategoria === s,
      })),
    ];
  }

  const opcionesMarca: Opcion[] = [
    { etiqueta: "Todas las marcas", href: hrefCategoria(slug, estado, { marca: undefined }), activa: !estado.marca },
    ...marcas.map((m) => ({ etiqueta: m, href: hrefCategoria(slug, estado, { marca: m }), activa: estado.marca === m })),
  ];

  return (
    <div className="space-y-6">
      {opcionesSub.length > 0 && (
        <GrupoFiltro
          titulo="Subcategoría"
          opciones={opcionesSub}
          cabecera={
            navegacion && actual ? (
              <RutaArbol slug={slug} estado={estado} nombreCategoria={nombreCategoria} navegacion={navegacion} />
            ) : undefined
          }
        />
      )}
      {marcas.length > 0 && <GrupoFiltro titulo="Marca" opciones={opcionesMarca} />}
      {hayFiltros && (
        <Link
          href={hrefCategoria(slug, estado, { marca: undefined, subcategoria: undefined, sub: undefined })}
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
