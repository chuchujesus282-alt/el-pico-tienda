// Opiniones de clientes sobre un producto: ver docs/datos.md. Si cambia, avisa al compañero.

export type Calificacion = 1 | 2 | 3 | 4 | 5;

export type Opinion = {
  id: string;
  productoId: string;
  autor: string; // nombre visible, ej. "María G."
  calificacion: Calificacion;
  comentario: string;
  fecha: string; // ISO 8601, ej. "2026-09-14"
};

export type ResumenOpiniones = {
  promedio: number; // 0 si no hay opiniones; 1 decimal
  total: number;
  /** Cantidad por estrellas: índice 0 = 5 estrellas … índice 4 = 1 estrella. */
  porEstrellas: [number, number, number, number, number];
};
