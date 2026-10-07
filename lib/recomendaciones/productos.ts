import type { Producto } from "@/types/catalogo";
import { esMedida, palabrasClave } from "./normalizar";
import type { ProductoIndexado } from "./tipos";

/** Normaliza un producto una vez para buscarlo y compararlo. */
export function indexarProducto(producto: Producto): ProductoIndexado {
  const tokens = palabrasClave(producto.nombre);
  const extra = [
    ...(producto.marca ? palabrasClave(producto.marca) : []),
    ...(producto.subcategoria ? palabrasClave(producto.subcategoria) : []),
    ...palabrasClave(producto.categoriaSlug.replace(/-/g, " ")),
  ];
  return {
    producto,
    tokens,
    todas: new Set([...tokens, ...extra]),
    tipo: tokens.find((t) => !esMedida(t)) ?? "",
    medidas: tokens.filter(esMedida),
  };
}

export type CatalogoPreparado = {
  lista: ProductoIndexado[];
  porId: Map<string, ProductoIndexado>;
};

// Se prepara una sola vez por lista de productos (la misma lista no se vuelve a normalizar).
const cache = new WeakMap<Producto[], CatalogoPreparado>();

export function prepararCatalogo(productos: Producto[]): CatalogoPreparado {
  let preparado = cache.get(productos);
  if (!preparado) {
    const lista = productos.map(indexarProducto);
    preparado = { lista, porId: new Map(lista.map((p) => [p.producto.id, p])) };
    cache.set(productos, preparado);
  }
  return preparado;
}

export const ventas = (p: Producto) => p.ventas ?? 0;

/** Los más vendidos (opcionalmente de una categoría), sin los IDs excluidos. */
export function masVendidos(
  productos: Producto[],
  limite = 10,
  { categoria, excluir }: { categoria?: string; excluir?: Set<string> } = {},
): Producto[] {
  return productos
    .filter((p) => (!categoria || p.categoriaSlug === categoria) && !excluir?.has(p.id))
    .sort((a, b) => ventas(b) - ventas(a))
    .slice(0, limite);
}
