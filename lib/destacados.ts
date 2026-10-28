import type { Producto } from "@/types/catalogo";

// Productos destacados del inicio ("Nuestros recomendados", "Te puede interesar" de un cliente nuevo y los carruseles
// por categoría) mientras no tengamos "Más vendidos" de Saint. Responsable: persona A.
// - Primero, los códigos de datos/destacados.json (editable sin programar), en ese orden. Los que ya no existan en
//   Saint se saltan.
// - Si faltan (o la lista está vacía): una MEZCLA AUTOMÁTICA, un producto de cada subcategoría, repartidos entre
//   categorías, siempre los mismos durante el día (cambian al día siguiente).
// Lógica pura (sin red): la llama lib/catalogo.ts con la lista de todos los productos.

type Opciones = {
  /** Códigos elegidos a mano (datos/destacados.json). */
  codigos?: string[];
  /** Solo productos de esta categoría (slug). */
  categoria?: string;
  limite?: number;
  /** "2026-10-28": la mezcla es la misma todo ese día. */
  dia: string;
  /** Para que dos secciones del mismo día no muestren la misma mezcla. */
  semilla?: string;
};

/** Número estable a partir de un texto (FNV-1a): la misma entrada da siempre el mismo orden. */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Un producto de cada subcategoría, en un orden que cambia cada día. Primero uno de cada categoría (para que se vean
 * variadas) y después el resto.
 */
export function mezclaDelDia(productos: Producto[], limite: number, dia: string, semilla = "", excluir = new Set<string>()): Producto[] {
  const grupos = new Map<string, Producto[]>();
  for (const p of productos) {
    if (excluir.has(p.id) || !(p.precio > 0)) continue;
    const clave = `${p.categoriaSlug}|${p.subcategoria ?? ""}`;
    const grupo = grupos.get(clave);
    if (grupo) grupo.push(p);
    else grupos.set(clave, [p]);
  }
  const ordenados = [...grupos]
    .map(([clave, lista]) => ({ clave, lista, orden: hash(`${dia}|${semilla}|${clave}`) }))
    .sort((a, b) => a.orden - b.orden || a.clave.localeCompare(b.clave));

  const elegidos: Producto[] = [];
  const categorias = new Set<string>();
  const usados = new Set<string>();
  // 1.ª vuelta: una subcategoría por categoría; 2.ª: las demás subcategorías.
  for (const vuelta of [1, 2]) {
    for (const { clave, lista } of ordenados) {
      if (elegidos.length >= limite) return elegidos;
      const categoria = lista[0].categoriaSlug;
      if (usados.has(clave) || (vuelta === 1 && categorias.has(categoria))) continue;
      usados.add(clave);
      categorias.add(categoria);
      elegidos.push(lista[hash(`${dia}|${semilla}|${clave}|producto`) % lista.length]);
    }
  }
  return elegidos;
}

/** Los destacados de una sección: los códigos elegidos a mano y, si faltan, la mezcla del día. */
export function elegirDestacados(productos: Producto[], { codigos = [], categoria, limite = 10, dia, semilla }: Opciones): Producto[] {
  const candidatos = categoria ? productos.filter((p) => p.categoriaSlug === categoria) : productos;
  const porId = new Map(candidatos.map((p) => [p.id, p]));
  const aMano = [...new Set(codigos)].map((id) => porId.get(id)).filter((p): p is Producto => Boolean(p)).slice(0, limite);
  if (aMano.length >= limite) return aMano;
  const ya = new Set(aMano.map((p) => p.id));
  return [...aMano, ...mezclaDelDia(candidatos, limite - aMano.length, dia, semilla ?? categoria ?? "", ya)];
}

/** "2026-10-28" en Caracas (la mezcla cambia a medianoche de la tienda, no de quien visita). */
export function diaDeHoy(ahora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas" }).format(ahora);
}
