// Cómo se junta lo que el cliente tenía en el navegador (sin sesión) con lo que ya estaba en su cuenta, al entrar.
// Puro (sin base de datos ni navegador): se prueba en lib/__tests__/mezclaCuenta.test.ts.

import { MAXIMO_DIRECCIONES, validarDireccion } from "./direcciones";
import type { Direccion } from "@/types/cliente";

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

/* ---------- Direcciones (fase 5) ---------- */


export type DireccionesCuenta = { lista: Direccion[]; elegidaId: string | null };

/** Deja solo direcciones válidas (las mismas reglas del formulario), sin ids repetidos, máx. 10, y una elegida que exista. */
export function limpiarDirecciones(datos: unknown): DireccionesCuenta {
  const crudo = (datos ?? {}) as { lista?: unknown; elegidaId?: unknown };
  const lista: Direccion[] = [];
  const ids = new Set<string>();
  for (const d of Array.isArray(crudo.lista) ? crudo.lista : []) {
    const x = (d ?? {}) as Partial<Direccion>;
    if (!idValido(x.id) || ids.has(x.id) || typeof x.nombre !== "string" || typeof x.descripcion !== "string") continue;
    const direccion: Direccion = {
      id: x.id,
      nombre: x.nombre.trim(),
      descripcion: x.descripcion.trim(),
      latitud: Number(x.latitud),
      longitud: Number(x.longitud),
    };
    if (Object.keys(validarDireccion(direccion)).length > 0) continue;
    ids.add(direccion.id);
    lista.push(direccion);
    if (lista.length === MAXIMO_DIRECCIONES) break;
  }
  const elegidaId = typeof crudo.elegidaId === "string" && ids.has(crudo.elegidaId) ? crudo.elegidaId : (lista[0]?.id ?? null);
  return { lista, elegidaId };
}

/** Metros entre dos puntos (fórmula del haversine). */
export function distanciaMetros(a: Pick<Direccion, "latitud" | "longitud">, b: Pick<Direccion, "latitud" | "longitud">): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitud - a.latitud);
  const dLon = rad(b.longitud - a.longitud);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

const mismoNombre = (a: string, b: string) =>
  a.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase() ===
  b.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();

/** Dos direcciones son la misma si tienen el mismo id, o el mismo nombre y casi el mismo punto (menos de 25 m). */
export const METROS_MISMA_DIRECCION = 25;
function esLaMisma(a: Direccion, b: Direccion): boolean {
  return a.id === b.id || (mismoNombre(a.nombre, b.nombre) && distanciaMetros(a, b) < METROS_MISMA_DIRECCION);
}

/**
 * Direcciones al entrar: las de la cuenta y, después, las del navegador que no estén ya (mismo id, o mismo nombre y
 * casi el mismo punto); si la del navegador tiene el mismo id, gana la del navegador (es la última edición).
 * Máx. 10. Queda elegida la que estaba elegida en el navegador (o su igual en la cuenta); si no, la de la cuenta.
 */
export function mezclarDirecciones(navegador: DireccionesCuenta, cuenta: DireccionesCuenta): DireccionesCuenta {
  const lista = [...cuenta.lista];
  const equivalente = new Map<string, string>(); // id del navegador → id con el que quedó
  for (const d of navegador.lista) {
    const i = lista.findIndex((c) => esLaMisma(c, d));
    if (i === -1) {
      lista.push(d);
      equivalente.set(d.id, d.id);
    } else {
      if (lista[i].id === d.id) lista[i] = d;
      equivalente.set(d.id, lista[i].id);
    }
  }
  const final = lista.slice(0, MAXIMO_DIRECCIONES);
  const existe = (id: string | null | undefined) => (id && final.some((d) => d.id === id) ? id : null);
  const elegidaId =
    existe(navegador.elegidaId ? equivalente.get(navegador.elegidaId) : null) ?? existe(cuenta.elegidaId) ?? final[0]?.id ?? null;
  return { lista: final, elegidaId };
}
