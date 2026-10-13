import "server-only";
import type { TasaBCV } from "@/types/tasa";

// ÚNICA puerta de entrada a la tasa BCV. La tasa NO vive en el código: viene de la base de datos
// por un endpoint que responde { "tasa": 245.8, "fecha": "2026-10-12T13:00:00-04:00" }.
//
// >>> PENDIENTE: definir TASA_BCV_API_URL en .env.local (y en Vercel) con la URL de ese endpoint. <<<
// Mientras no exista, getTasaBCV() devuelve null y el header muestra un guion.

const API_URL = process.env.TASA_BCV_API_URL;
// Mismo token que el catálogo: la consulta sale del servidor de Next, nunca del navegador.
const API_TOKEN = process.env.CATALOGO_API_TOKEN;
const REVALIDAR_SEGUNDOS = 600;

/** Tasa BCV vigente, o null si no hay endpoint, no responde o responde algo inválido. Nunca lanza. */
export async function getTasaBCV(): Promise<TasaBCV | null> {
  if (!API_URL) return null;
  try {
    const respuesta = await fetch(API_URL, {
      headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : undefined,
      next: { revalidate: REVALIDAR_SEGUNDOS },
    });
    if (!respuesta.ok) return null;
    const datos = (await respuesta.json()) as Partial<TasaBCV>;
    const tasa = Number(datos.tasa);
    if (!Number.isFinite(tasa) || tasa <= 0 || typeof datos.fecha !== "string") return null;
    return { tasa, fecha: datos.fecha };
  } catch {
    return null;
  }
}
