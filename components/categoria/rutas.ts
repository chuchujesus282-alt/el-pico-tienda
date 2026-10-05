import type { OrdenProductos } from "@/types/catalogo";

// Los filtros, el orden y la página viven en la URL (?marca=&subcategoria=&orden=&pagina=)
// para que se puedan compartir y el botón "atrás" funcione.

export type EstadoCategoria = {
  marca?: string;
  subcategoria?: string;
  orden: OrdenProductos;
  pagina: number;
};

export const OPCIONES_ORDEN: { valor: OrdenProductos; etiqueta: string }[] = [
  { valor: "relevancia", etiqueta: "Relevancia" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "nombre", etiqueta: "Nombre (A-Z)" },
];

type ParametrosUrl = Record<string, string | string[] | undefined>;

function primero(valor: string | string[] | undefined): string | undefined {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto?.trim() || undefined;
}

/** Convierte los searchParams en un estado válido; ignora valores desconocidos. */
export function leerEstado(parametros: ParametrosUrl): EstadoCategoria {
  const orden = primero(parametros.orden);
  const pagina = Number.parseInt(primero(parametros.pagina) ?? "", 10);
  return {
    marca: primero(parametros.marca),
    subcategoria: primero(parametros.subcategoria),
    orden: OPCIONES_ORDEN.some((o) => o.valor === orden) ? (orden as OrdenProductos) : "relevancia",
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

/** Enlace a la categoría con el estado actual más los cambios. Cambiar un filtro vuelve a la página 1. */
export function hrefCategoria(slug: string, estado: EstadoCategoria, cambios: Partial<EstadoCategoria> = {}): string {
  const final = { ...estado, pagina: 1, ...cambios };
  const busqueda = new URLSearchParams();
  if (final.subcategoria) busqueda.set("subcategoria", final.subcategoria);
  if (final.marca) busqueda.set("marca", final.marca);
  if (final.orden !== "relevancia") busqueda.set("orden", final.orden);
  if (final.pagina > 1) busqueda.set("pagina", String(final.pagina));
  const texto = busqueda.toString();
  return `/categoria/${encodeURIComponent(slug)}${texto ? `?${texto}` : ""}`;
}
