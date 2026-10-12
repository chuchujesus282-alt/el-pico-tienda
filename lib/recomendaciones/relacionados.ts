import type { CompradoJunto, Producto } from "@/types/catalogo";
import { coincidencia, complementosDe } from "./diccionarios";
import { indexarProducto, masVendidos, prepararCatalogo, ventas } from "./productos";
import type { ProductoIndexado } from "./tipos";

// "También te puede servir": mezcla complementarios (lo que se usa junto, según datos/complementarios.json),
// similares (mismo tipo, medida o subcategoría) y, cuando haya facturas, lo que se compra junto.

const log = (n: number) => Math.log10(1 + n);

/** Lo que se usa junto con `base`: el mejor producto de cada tipo complementario, en orden de importancia. */
export function complementariosDe(base: ProductoIndexado, catalogo: ProductoIndexado[], limite = 4): ProductoIndexado[] {
  const elegidos: ProductoIndexado[] = [];
  for (const frase of complementosDe(base)) {
    if (elegidos.length >= limite) break;
    let mejor: { p: ProductoIndexado; puntaje: number } | null = null;
    for (const p of catalogo) {
      if (p.producto.id === base.producto.id || elegidos.includes(p)) continue;
      const c = coincidencia(p, frase);
      if (!c) continue;
      // Empieza con el tipo > lo menciona; misma medida suma (tornillo 1/4 → ramplug 1/4); luego, lo más vendido.
      const mismaMedida = p.medidas.some((m) => base.medidas.includes(m)) ? 2 : 0;
      const puntaje = c * 10 + mismaMedida + log(ventas(p.producto));
      if (!mejor || puntaje > mejor.puntaje) mejor = { p, puntaje };
    }
    if (mejor) elegidos.push(mejor.p);
  }
  return elegidos;
}

/** Parecidos a `base`: mismo tipo o subcategoría, y suman la misma medida, la marca y un precio cercano. */
export function similaresDe(base: ProductoIndexado, catalogo: ProductoIndexado[], limite = 4): ProductoIndexado[] {
  const b = base.producto;
  return catalogo
    .filter((p) => p.producto.id !== b.id)
    .map((p) => {
      const q = p.producto;
      let puntaje = 0;
      if (p.tipo && p.tipo === base.tipo) puntaje += 3;
      if (q.subcategoria && q.subcategoria === b.subcategoria) puntaje += 2;
      if (q.categoriaSlug === b.categoriaSlug) puntaje += 1;
      puntaje += Math.min(2, p.medidas.filter((m) => base.medidas.includes(m)).length) * 1.5;
      if (q.marca && q.marca === b.marca) puntaje += 0.5;
      if (q.precio > 0 && b.precio > 0) puntaje += Math.max(0, 1 - Math.abs(Math.log(q.precio / b.precio)) / Math.log(4));
      return { p, puntaje };
    })
    .filter((x) => x.puntaje >= 3) // al menos mismo tipo, o misma subcategoría y categoría
    .sort((x, y) => y.puntaje - x.puntaje || ventas(y.p.producto) - ventas(x.p.producto))
    .slice(0, limite)
    .map((x) => x.p);
}

/**
 * "Comprados juntos" a partir de facturas (cada factura = lista de IDs de producto).
 * Puntaje = veces juntos / √(facturas de A × facturas de B): premia lo que va junto de verdad y no
 * lo que se vende con todo. Lista para cuando el SQL entregue las facturas (o para calcularlo en la API).
 */
export function compradosJuntos(id: string, facturas: string[][], { limite = 8, minimoVeces = 2 } = {}): CompradoJunto[] {
  const enFacturas = new Map<string, number>();
  const conId = new Map<string, number>();
  for (const factura of facturas) {
    const unicos = new Set(factura);
    for (const otro of unicos) enFacturas.set(otro, (enFacturas.get(otro) ?? 0) + 1);
    if (!unicos.has(id)) continue;
    for (const otro of unicos) if (otro !== id) conId.set(otro, (conId.get(otro) ?? 0) + 1);
  }
  const deId = enFacturas.get(id) ?? 0;
  return [...conId]
    .filter(([, veces]) => veces >= minimoVeces)
    .map(([otro, veces]) => ({ id: otro, puntaje: veces / Math.sqrt(deId * (enFacturas.get(otro) ?? 1)) }))
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limite);
}

type OpcionesRelacionados = {
  minimo?: number;
  maximo?: number;
  /** De getCompradosJuntos() (facturas del SQL). Vacío mientras no haya datos. */
  juntos?: CompradoJunto[];
};

/** Entre `minimo` y `maximo` productos para "También te puede servir", sin repetir el actual. */
export function relacionados(
  producto: Producto,
  productos: Producto[],
  { minimo = 4, maximo = 8, juntos = [] }: OpcionesRelacionados = {},
): Producto[] {
  const { lista, porId } = prepararCatalogo(productos);
  const base = porId.get(producto.id) ?? indexarProducto(producto);

  const elegidos = new Map<string, Producto>();
  const sumar = (p: Producto | undefined) => {
    if (p && p.id !== producto.id && elegidos.size < maximo) elegidos.set(p.id, p);
  };

  // 1. Lo que de verdad se compra junto (cuando haya facturas): hasta 2.
  juntos.slice(0, 2).forEach((j) => sumar(porId.get(j.id)?.producto));

  // 2. Complementarios y similares, intercalados para que haya de los dos.
  const comp = complementariosDe(base, lista, 4);
  const sim = similaresDe(base, lista, maximo);
  for (let i = 0; i < Math.max(comp.length, sim.length); i++) {
    sumar(comp[i]?.producto);
    sumar(sim[i]?.producto);
  }

  // 3. Si no alcanza el mínimo: los más vendidos de su categoría y, si hace falta, de toda la tienda.
  if (elegidos.size < minimo) {
    const excluir = new Set([producto.id, ...elegidos.keys()]);
    masVendidos(productos, minimo, { categoria: producto.categoriaSlug, excluir }).forEach(sumar);
  }
  if (elegidos.size < minimo) {
    const excluir = new Set([producto.id, ...elegidos.keys()]);
    masVendidos(productos, minimo - elegidos.size, { excluir }).forEach(sumar);
  }
  return [...elegidos.values()];
}
