// Mapa de categorías de la web → código de la categoría en Saint (el sistema de la tienda). TODAS las categorías de la
// web traen sus productos REALES de Saint (lib/saint.ts); ya no hay productos de ejemplo. Responsable: persona A.
// Los slugs son los de lib/categorias.ts. NUNCA agregar el código 1 ("POR ARREGLAR" en Saint): no va en la página.

export const CATEGORIAS_SAINT: Record<string, number> = {
  herramientas: 1171,
  construccion: 1498,
  tornilleria: 1620,
  electricidad: 1685,
  griferia: 1758,
  "hogar-y-jardin": 1872,
  pinturas: 1835,
  cerrajeria: 1653,
  vehiculos: 1949,
  "seguridad-industrial": 1912,
};

/** Código de Saint de la categoría, o undefined si no está en el mapa. */
export function codigoSaint(slug: string): number | undefined {
  return Object.hasOwn(CATEGORIAS_SAINT, slug) ? CATEGORIAS_SAINT[slug] : undefined;
}
