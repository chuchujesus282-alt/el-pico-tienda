// Precios al día de productos sueltos, con &codigos=A,B,C de la API de Saint (responsable: persona A). Lógica pura (sin
// red): lib/saint.ts hace el pedido y esto lee la respuesta. Con pruebas en lib/__tests__/preciosSaint.test.ts.
// La API: máximo 50 códigos por pedido, solo letras, números y . _ - /; lee tasa y precios en cada pedido (sin caché).
// Un código que no está a la venta (inactivo, sin precio, inexistente o de la categoría 1 "POR ARREGLAR") no viene.

import { limpiarDescripcion } from "@/lib/nombresSaint";

/** Máximo de códigos por pedido que acepta la API. */
export const CODIGOS_POR_PEDIDO = 50;
/** Lo que acepta la API en un código (lo demás responde 400 y tumbaría el pedido entero). */
const CODIGO_VALIDO = /^[A-Za-z0-9._\-/]+$/;

/** `descripcion`: la de hoy (lib/nombresSaint.ts, limpiarDescripcion), null si no tiene. */
export type PrecioAlDia = { precio: number; precioBs?: number; tasa?: number; descripcion: string | null };

export const esCodigoValido = (codigo: string) => codigo.length <= 64 && CODIGO_VALIDO.test(codigo);

/** Los códigos en tandas de CODIGOS_POR_PEDIDO, sin repetir. */
export function enTandas(codigos: string[]): string[][] {
  const unicos = [...new Set(codigos)];
  const tandas: string[][] = [];
  for (let i = 0; i < unicos.length; i += CODIGOS_POR_PEDIDO) tandas.push(unicos.slice(i, i + CODIGOS_POR_PEDIDO));
  return tandas;
}

const numero = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN);
const redondear = (n: number) => Math.round(n * 100) / 100;

/**
 * Respuesta de &codigos= → precio de cada código pedido que sigue a la venta, y los que no vinieron (`retirados`). Por
 * seguridad, se ignora todo producto cuya categoría no esté en `categoriasPermitidas` (lib/categoriasSaint.ts) o que
 * no se haya pedido. Lanza si la respuesta no trae lista de productos (eso no es "nada a la venta", es un error).
 */
export function leerPrecios(
  crudo: unknown,
  pedidos: string[],
  categoriasPermitidas: Set<number>,
): { precios: Map<string, PrecioAlDia>; retirados: string[] } {
  const datos = (crudo ?? {}) as { tasa?: unknown; productos?: unknown };
  if (!Array.isArray(datos.productos)) throw new Error("Saint respondió sin lista de productos");
  const tasa = numero(datos.tasa);
  const pedidosSet = new Set(pedidos);
  const precios = new Map<string, PrecioAlDia>();
  for (const fila of datos.productos) {
    const { codigo, nombre, descripcion, codCategoria, precioUsd, precioBs } = (fila ?? {}) as Record<string, unknown>;
    if (typeof codigo !== "string") continue;
    const id = codigo.trim();
    if (!pedidosSet.has(id) || !categoriasPermitidas.has(numero(codCategoria))) continue;
    const precio = numero(precioUsd);
    if (!Number.isFinite(precio) || precio <= 0) continue;
    const bs = numero(precioBs);
    precios.set(id, {
      precio: redondear(precio),
      ...(Number.isFinite(bs) && bs > 0 ? { precioBs: redondear(bs) } : {}),
      ...(Number.isFinite(tasa) && tasa > 0 ? { tasa } : {}),
      descripcion: limpiarDescripcion(descripcion, typeof nombre === "string" ? nombre : "", id),
    });
  }
  return { precios, retirados: pedidos.filter((id) => !precios.has(id)) };
}
