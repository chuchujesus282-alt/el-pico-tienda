import type { Opinion, ResumenOpiniones } from "@/types/opiniones";

/** Promedio (1 decimal), total y cantidad por estrellas. Sirve en servidor y en navegador. */
export function resumirOpiniones(opiniones: Opinion[]): ResumenOpiniones {
  const porEstrellas: ResumenOpiniones["porEstrellas"] = [0, 0, 0, 0, 0];
  for (const o of opiniones) porEstrellas[5 - o.calificacion]++;
  const total = opiniones.length;
  const suma = opiniones.reduce((s, o) => s + o.calificacion, 0);
  return { promedio: total ? Math.round((suma / total) * 10) / 10 : 0, total, porEstrellas };
}
