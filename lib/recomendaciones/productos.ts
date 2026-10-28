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
/**
 * Cede el turno (en el navegador: clics, teclado, animaciones; en el servidor: las otras visitas) y sigue después.
 * En el servidor (Node) con setImmediate: setTimeout(0) espera de más entre tandas (con 30.000 productos, armar el
 * índice tardaba 3,9 s en vez de 0,8 s). El navegador no tiene setImmediate: ahí sigue con setTimeout.
 */
export const respirar = () =>
  new Promise<void>((listo) => (typeof setImmediate === "function" ? setImmediate(listo) : setTimeout(listo, 0)));

/**
 * Los `limite` primeros de una lista según `comparar`, sin ordenar la lista entera: da lo mismo que
 * `[...].sort(comparar).slice(0, limite)` (en los empates, el que aparece antes), pero con 30.000 productos y un límite
 * de 4 a 10 es mucho más rápido y no crea una copia de la lista.
 */
export class Mejores<T> {
  private lista: T[] = [];
  constructor(
    private readonly limite: number,
    private readonly comparar: (a: T, b: T) => number,
  ) {}

  ofrecer(item: T) {
    const { lista, limite, comparar } = this;
    if (limite <= 0) return;
    if (lista.length === limite && comparar(item, lista[lista.length - 1]) >= 0) return;
    // Va antes del primero que le gana estrictamente: así los empates quedan en el orden en que llegaron.
    let i = lista.length;
    while (i > 0 && comparar(item, lista[i - 1]) < 0) i--;
    lista.splice(i, 0, item);
    if (lista.length > limite) lista.pop();
  }

  resultado(): T[] {
    return this.lista;
  }
}

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
  const mejores = new Mejores<Producto>(limite, (a, b) => ventas(b) - ventas(a));
  for (const p of productos) if ((!categoria || p.categoriaSlug === categoria) && !excluir?.has(p.id)) mejores.ofrecer(p);
  return mejores.resultado();
}
