import "server-only";

import type { Opinion } from "@/types/opiniones";

// ÚNICA puerta de entrada a las opiniones de productos.
// Todavía no hay base de datos de opiniones: devuelve una lista vacía (las que escribe el cliente se guardan en su
// navegador, ver components/opiniones/almacenOpiniones.ts). Las opiniones FALSAS de prueba se borraron el 2026-10-28
// junto con los productos de ejemplo: nunca se muestran reseñas inventadas.

export async function getOpiniones(productoId: string): Promise<Opinion[]> {
  void productoId; // TODO: GET /productos/:id/opiniones cuando exista la base de datos
  return [];
}
