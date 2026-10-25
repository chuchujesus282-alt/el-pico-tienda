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

function guardar(productos: Producto[], lista: ProductoIndexado[]): CatalogoPreparado {
  const preparado = { lista, porId: new Map(lista.map((p) => [p.producto.id, p])) };
  cache.set(productos, preparado);
  return preparado;
}

export function prepararCatalogo(productos: Producto[]): CatalogoPreparado {
  return cache.get(productos) ?? guardar(productos, productos.map(indexarProducto));
}

/** Cuántos productos se procesan seguidos antes de dejar respirar al navegador (ver prepararCatalogoPorPartes). */
export const TANDA = 250;
/** Cede el turno al navegador (clics, teclado, animaciones) y sigue después. */
export const respirar = () => new Promise<void>((listo) => setTimeout(listo, 0));

/**
 * Igual que prepararCatalogo, pero por tandas, cediendo el turno entre una y otra: en el navegador, con miles de
 * productos, así no se congela la página. Mismo resultado y misma caché.
 */
export async function prepararCatalogoPorPartes(productos: Producto[]): Promise<CatalogoPreparado> {
  const guardado = cache.get(productos);
  if (guardado) return guardado;
  const lista: ProductoIndexado[] = [];
  for (let i = 0; i < productos.length; i += TANDA) {
    for (const p of productos.slice(i, i + TANDA)) lista.push(indexarProducto(p));
    if (i + TANDA < productos.length) await respirar();
  }
  return cache.get(productos) ?? guardar(productos, lista);
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
