import { Search } from "lucide-react";
import type { EstadoCategoria } from "./rutas";

type Props = {
  slug: string;
  nombre: string;
  estado: EstadoCategoria;
};

/**
 * "Buscar en Herramientas": formulario normal (sin JavaScript) que deja la búsqueda en la URL (?q=), junto con la
 * subcategoría y el orden que ya estaban. La búsqueda la hace el servidor sobre toda la categoría y luego pagina.
 */
export default function BuscarEnCategoria({ slug, nombre, estado }: Props) {
  return (
    <form action={`/categoria/${encodeURIComponent(slug)}`} method="get" role="search" className="relative mb-4">
      <label htmlFor="buscar-en-categoria" className="sr-only">
        Buscar en {nombre}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gris-texto" aria-hidden />
      <input
        id="buscar-en-categoria"
        type="search"
        name="q"
        defaultValue={estado.q ?? ""}
        maxLength={80}
        placeholder={`Buscar en ${nombre}: nombre, código o marca`}
        className="h-11 w-full rounded-boton border border-gris-borde bg-pico-blanco pr-24 pl-10 text-sm text-texto shadow-tarjeta transition placeholder:text-gris-texto focus:border-logo-marino focus:ring-4 focus:ring-logo-marino/15 focus:outline-none"
      />
      {estado.subcategoria && <input type="hidden" name="subcategoria" value={estado.subcategoria} />}
      {estado.marca && <input type="hidden" name="marca" value={estado.marca} />}
      {estado.orden !== "relevancia" && <input type="hidden" name="orden" value={estado.orden} />}
      <button
        type="submit"
        className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 rounded-boton bg-logo-marino px-4 text-xs font-semibold text-pico-blanco transition-colors hover:bg-logo-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino"
      >
        Buscar
      </button>
    </form>
  );
}
