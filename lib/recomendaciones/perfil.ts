import type { Senal, TipoSenal } from "./tipos";

// Perfil de intereses del cliente: una lista de señales con fecha. Lógica pura (sin localStorage),
// para usarla igual con las señales del navegador o con el historial de compras del SQL.

/** Cuánto pesa cada señal (más alto = dice más de lo que el cliente quiere). */
export const PESOS: Record<TipoSenal, number> = {
  compra: 8, // historial real de facturas (cuando llegue del SQL)
  whatsapp: 8, // pedido enviado por WhatsApp desde el carrito
  carrito: 4,
  visto: 2,
  busqueda: 1,
};

/** A los 30 días una señal vale la mitad; a los 60, un cuarto. */
export const VIDA_MEDIA_DIAS = 30;
export const MAXIMO_SENALES = 200;

const DIA = 24 * 60 * 60 * 1000;
const MEDIA_HORA = 30 * 60 * 1000;

/** Peso actual de una señal: peso de su tipo × 0,5^(días / 30). */
export function pesoSenal(senal: Senal, ahora = Date.now()): number {
  const dias = Math.max(0, ahora - senal.fecha) / DIA;
  return PESOS[senal.tipo] * Math.pow(0.5, dias / VIDA_MEDIA_DIAS);
}

/** Agrega una señal. No repite la misma (tipo + producto/término) dentro de media hora y guarda solo las últimas 200. */
export function agregarSenal(senales: Senal[], nueva: Senal, maximo = MAXIMO_SENALES): Senal[] {
  const repetida = senales.some(
    (s) =>
      s.tipo === nueva.tipo &&
      s.id === nueva.id &&
      s.termino === nueva.termino &&
      Math.abs(nueva.fecha - s.fecha) < MEDIA_HORA,
  );
  if (repetida) return senales;
  return [...senales, nueva].slice(-maximo);
}

const TIPOS = new Set<string>(Object.keys(PESOS));

/** Valida lo que venga de localStorage (o de cualquier lado): descarta lo que no tenga la forma correcta. */
export function validarSenales(datos: unknown): Senal[] {
  if (!Array.isArray(datos)) return [];
  return datos.filter(
    (s): s is Senal =>
      !!s &&
      typeof s === "object" &&
      TIPOS.has(s.tipo) &&
      typeof s.fecha === "number" &&
      Number.isFinite(s.fecha) &&
      (s.tipo === "busqueda" ? typeof s.termino === "string" && !!s.termino : typeof s.id === "string" && !!s.id),
  );
}

/**
 * Historial de compras del SQL → señales del perfil. El algoritmo de "Te puede interesar" no cambia:
 * basta con sumar estas señales a las del navegador.
 */
export function senalesDesdeCompras(compras: { productoId: string; fecha: string | number | Date }[]): Senal[] {
  return compras
    .map((c) => ({ tipo: "compra" as const, id: c.productoId, fecha: new Date(c.fecha).getTime() }))
    .filter((s) => Number.isFinite(s.fecha));
}
