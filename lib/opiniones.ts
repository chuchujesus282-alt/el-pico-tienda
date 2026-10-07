import "server-only";

import type { Opinion } from "@/types/opiniones";
import { opinionesMock } from "@/lib/mock/opiniones";

// ÚNICA puerta de entrada a las opiniones de productos.
// Sin CATALOGO_API_URL usa opiniones de prueba (falsas, solo para el diseño). Con ella, por ahora no hay
// endpoint de opiniones: devuelve una lista vacía para no mostrar nunca reseñas inventadas en producción.

const API_URL = process.env.CATALOGO_API_URL;

export async function getOpiniones(productoId: string): Promise<Opinion[]> {
  if (!API_URL) return opinionesMock(productoId);
  return []; // TODO: GET /productos/:id/opiniones cuando exista la base de datos
}
