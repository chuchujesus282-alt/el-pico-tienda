// Qué escena 3D muestra hoy el banner de Grifería del carrusel (GriferiaAgua): se alterna cada día según la fecha
// LOCAL del visitante. Días pares del año (1 de enero = día 0) la ducha; impares, el lavamanos.

export type EscenaGriferia = "ducha" | "lavamanos";

export const DESCRIPCION_GRIFERIA: Record<EscenaGriferia, string> = {
  ducha: "Duchas, regaderas, mezcladoras y grifería para baño y cocina.",
  lavamanos: "Grifería, lavamanos, llaves y accesorios para baño y cocina.",
};

/** Día del año (0 = 1 de enero) de la fecha local, sin que el horario de verano mueva la cuenta. */
function diaDelAnio(fecha: Date): number {
  const hoy = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  return Math.round((hoy - Date.UTC(fecha.getFullYear(), 0, 1)) / 864e5);
}

export function escenaDelDia(fecha = new Date()): EscenaGriferia {
  return diaDelAnio(fecha) % 2 === 0 ? "ducha" : "lavamanos";
}

/** La de la fecha, o la forzada con ?escena=ducha|lavamanos (para revisarla). */
export function elegirEscenaGriferia(forzada: string | null, fecha = new Date()): EscenaGriferia {
  return forzada === "ducha" || forzada === "lavamanos" ? forzada : escenaDelDia(fecha);
}
