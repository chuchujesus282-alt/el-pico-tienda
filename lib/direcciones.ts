import type { Direccion, Ubicacion } from "@/types/cliente";

// Reglas de las direcciones de entrega (sirven en el navegador y en las pruebas).

export const MAXIMO_DIRECCIONES = 10;
export const LARGO_NOMBRE = { minimo: 2, maximo: 30 };
export const LARGO_DESCRIPCION = { minimo: 5, maximo: 120 };

/** Donde abre el mapa si el cliente todavía no marcó nada: Caracas. */
export const CENTRO_INICIAL: Ubicacion = { latitud: 10.4880, longitud: -66.8792 };

/** Venezuela con un margen: fuera de aquí no se entrega, así que no se acepta el punto. */
const LIMITES = { latitud: [0.5, 12.5], longitud: [-73.5, -59.5] } as const;

export type ErroresDireccion = Partial<Record<"nombre" | "descripcion" | "ubicacion", string>>;

export function ubicacionValida({ latitud, longitud }: Ubicacion): boolean {
  return (
    Number.isFinite(latitud) &&
    Number.isFinite(longitud) &&
    latitud >= LIMITES.latitud[0] &&
    latitud <= LIMITES.latitud[1] &&
    longitud >= LIMITES.longitud[0] &&
    longitud <= LIMITES.longitud[1]
  );
}

/** Revisa una dirección antes de guardarla. Sin errores, el objeto viene vacío. */
export function validarDireccion(d: Pick<Direccion, "nombre" | "descripcion" | "latitud" | "longitud">): ErroresDireccion {
  const errores: ErroresDireccion = {};
  const nombre = d.nombre.trim();
  const descripcion = d.descripcion.trim();

  if (nombre.length < LARGO_NOMBRE.minimo) errores.nombre = "Ponle un nombre, ej. Casa u Obra.";
  else if (nombre.length > LARGO_NOMBRE.maximo) errores.nombre = `Máximo ${LARGO_NOMBRE.maximo} caracteres.`;

  if (descripcion.length < LARGO_DESCRIPCION.minimo)
    errores.descripcion = "Cuéntale al repartidor cómo llegar: edificio, piso o una referencia.";
  else if (descripcion.length > LARGO_DESCRIPCION.maximo) errores.descripcion = `Máximo ${LARGO_DESCRIPCION.maximo} caracteres.`;

  if (!ubicacionValida(d)) errores.ubicacion = "Marca en el mapa un punto dentro de Venezuela.";

  return errores;
}

/** Enlace que abre el punto en Google Maps (va en el mensaje de WhatsApp para el repartidor). */
export function enlaceMapa({ latitud, longitud }: Ubicacion): string {
  return `https://www.google.com/maps?q=${latitud.toFixed(6)},${longitud.toFixed(6)}`;
}

/** Texto de la dirección para el pedido de WhatsApp. */
export function textoDireccion(d: Direccion): string {
  return `${d.nombre} (${d.descripcion}). Ubicación: ${enlaceMapa(d)}`;
}

/**
 * Posición de un punto en los mosaicos del mapa (los cuadros de 256 px de OpenStreetMap) a un zoom dado:
 * qué mosaico es (`x`, `y`) y en qué píxel de ese mosaico cae (`px`, `py`). Lo usa la miniatura del mapa.
 */
export function posicionEnMosaico({ latitud, longitud }: Ubicacion, zoom: number) {
  const n = 2 ** zoom;
  const radianes = (latitud * Math.PI) / 180;
  const x = ((longitud + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(radianes) + 1 / Math.cos(radianes)) / Math.PI) / 2) * n;
  const mx = Math.floor(x);
  const my = Math.floor(y);
  return { x: mx, y: my, px: (x - mx) * 256, py: (y - my) * 256 };
}
