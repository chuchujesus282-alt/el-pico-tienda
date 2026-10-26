// Cómo se junta lo que el cliente tenía en el navegador (sin sesión) con lo que ya estaba en su cuenta, al entrar.
// Puro (sin base de datos ni navegador): se prueba en lib/__tests__/mezclaCuenta.test.ts.

export type LineaCarrito = { id: string; cantidad: number };

/** Topes para lo que llega del navegador (no es confiable). */
export const MAX_LINEAS = 200;
export const MAX_CANTIDAD = 9999;
const LARGO_MAX_ID = 64;

const idValido = (id: unknown): id is string => typeof id === "string" && id.length > 0 && id.length <= LARGO_MAX_ID;

/** Deja solo líneas válidas: código razonable, cantidad entera de 1 a MAX_CANTIDAD, sin códigos repetidos. */
export function limpiarCarrito(lineas: unknown): LineaCarrito[] {
  if (!Array.isArray(lineas)) return [];
  const vistos = new Set<string>();
  const limpias: LineaCarrito[] = [];
  for (const linea of lineas) {
    const { id, cantidad } = (linea ?? {}) as Partial<LineaCarrito>;
    if (!idValido(id) || vistos.has(id) || typeof cantidad !== "number" || !Number.isFinite(cantidad)) continue;
    const entera = Math.min(MAX_CANTIDAD, Math.floor(cantidad));
    if (entera < 1) continue;
    vistos.add(id);
    limpias.push({ id, cantidad: entera });
    if (limpias.length === MAX_LINEAS) break;
  }
  return limpias;
}

/** Deja solo códigos válidos, sin repetir, en el mismo orden. */
export function limpiarFavoritos(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.filter(idValido))].slice(0, MAX_LINEAS);
}

/**
 * Carrito al entrar: los productos de los dos lados; si un producto está en ambos, queda la cantidad MAYOR (no la
 * suma: si ya lo tenía en la cuenta y lo volvió a agregar sin sesión, no se le duplica el pedido).
 * Orden: primero lo de la cuenta (lo agregó antes) y después lo nuevo del navegador.
 */
export function mezclarCarrito(navegador: LineaCarrito[], cuenta: LineaCarrito[]): LineaCarrito[] {
  const mezcla = new Map<string, number>();
  for (const { id, cantidad } of [...cuenta, ...navegador]) mezcla.set(id, Math.max(mezcla.get(id) ?? 0, cantidad));
  return limpiarCarrito([...mezcla].map(([id, cantidad]) => ({ id, cantidad })));
}

/** Favoritos al entrar: todos los de los dos lados. Primero los del navegador (los más recientes), luego los de la cuenta. */
export function mezclarFavoritos(navegador: string[], cuenta: string[]): string[] {
  return limpiarFavoritos([...navegador, ...cuenta]);
}
