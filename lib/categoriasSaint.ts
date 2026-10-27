// Mapa de categorías de la web → código de la categoría en Saint (el sistema de la tienda).
// Una categoría que está aquí muestra los productos REALES de Saint (lib/saint.ts); las que no, siguen con los de
// ejemplo de lib/mock/ hasta que se agregue su código. Para sumar una: { "plomeria": 1234 } y listo.
// Responsable: persona A. Los slugs son los de lib/mock/categorias.ts.

export const CATEGORIAS_SAINT: Record<string, number> = {
  herramientas: 1171,
};

/** Código de Saint de la categoría, o undefined si todavía usa los productos de ejemplo. */
export function codigoSaint(slug: string): number | undefined {
  return Object.hasOwn(CATEGORIAS_SAINT, slug) ? CATEGORIAS_SAINT[slug] : undefined;
}
