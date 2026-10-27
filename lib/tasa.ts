import "server-only";
import type { TasaBCV } from "@/types/tasa";
import { getTasaSaint } from "@/lib/saint";

// ÚNICA puerta de entrada a la tasa BCV. La tasa NO vive en el código: viene de un endpoint que responde
// { "tasa": 886.23 } y, si la tiene, la fecha: { "tasa": 886.23, "fecha": "2026-10-23T13:00:00-04:00" }.
//
// La URL va en TASA_BCV_API_URL o en TASA_API_URL (cualquiera de las dos; en .env.local y en Vercel).
// Si falta o falla, se usa de respaldo la tasa con la que Saint calculó los precios (lib/saint.ts, la que trae
// PRODUCTOS_API_URL). Si tampoco hay, getTasaBCV() devuelve null y el header muestra un guion.

const API_URL = process.env.TASA_BCV_API_URL || process.env.TASA_API_URL;
// Mismo token que el catálogo: la consulta sale del servidor de Next, nunca del navegador.
const API_TOKEN = process.env.CATALOGO_API_TOKEN;
const REVALIDAR_SEGUNDOS = 600;

/** Tasa BCV vigente (o la de Saint de respaldo), o null si ninguna está disponible. Nunca lanza. */
export async function getTasaBCV(): Promise<TasaBCV | null> {
  const oficial = await getTasaOficial();
  if (oficial) return oficial;
  const deSaint = await getTasaSaint();
  return deSaint ? { tasa: deSaint } : null;
}

async function getTasaOficial(): Promise<TasaBCV | null> {
  if (!API_URL) return null;
  try {
    const respuesta = await fetch(API_URL, {
      headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : undefined,
      next: { revalidate: REVALIDAR_SEGUNDOS },
      signal: AbortSignal.timeout(8000),
    });
    if (!respuesta.ok) return null;
    const datos = (await respuesta.json()) as Partial<TasaBCV>;
    const tasa = Number(datos.tasa);
    if (!Number.isFinite(tasa) || tasa <= 0) return null;
    return typeof datos.fecha === "string" ? { tasa, fecha: datos.fecha } : { tasa };
  } catch {
    return null;
  }
}
