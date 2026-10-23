/** Tasa oficial del BCV tal como la entrega la base de datos. */
export type TasaBCV = {
  /** Bolívares por dólar, ej. 245.8 */
  tasa: number;
  /** Fecha de la tasa en formato ISO, ej. "2026-10-12T13:00:00-04:00". Opcional: hay APIs que solo envían la tasa. */
  fecha?: string;
};
