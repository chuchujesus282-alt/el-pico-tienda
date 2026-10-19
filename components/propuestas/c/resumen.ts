import { MATERIALES, type IdMaterial } from "@/lib/calculadoras/materiales";
import type { Calculadora } from "@/lib/calculadoras/tipos";

// Propuesta C — datos del panel, sacados tal cual de la calculadora (nada inventado).

export type MaterialResumido = { nombre: string; medidas: string[]; presentacion: string };

/** "Bloque de arcilla de 15 cm" → base "Bloque de arcilla", medida "15 cm"; 'Cabilla de 3/8"' → "Cabilla", '3/8"'. */
const CON_MEDIDA = /^(.*) de ([\d/,]+(?: cm|"))$/;

/**
 * Lo que devuelve la calculadora, sin repetir: las variantes de un mismo material (bloques de 10, 15 y 20 cm; cabillas de
 * 3/8", 1/2" y 5/8"; pintura en galón o cuñete) se juntan en una sola línea.
 */
export function materialesResumidos(ids: readonly IdMaterial[]): MaterialResumido[] {
  const lista: MaterialResumido[] = [];
  for (const id of ids) {
    const { nombre, presentacion } = MATERIALES[id];
    const coincide = CON_MEDIDA.exec(nombre);
    const base = coincide ? coincide[1] : nombre;
    const existente = lista.find((m) => m.nombre === base);
    if (existente) {
      if (coincide && !existente.medidas.includes(coincide[2])) existente.medidas.push(coincide[2]);
      if (!coincide && existente.presentacion !== presentacion) existente.presentacion = `${existente.presentacion} o ${presentacion.toLowerCase()}`;
      continue;
    }
    lista.push({ nombre: base, medidas: coincide ? [coincide[2]] : [], presentacion });
  }
  return lista;
}

/** Nombres de las herramientas sugeridas. */
export function herramientasSugeridas(calculadora: Calculadora): string[] {
  return calculadora.herramientas.map((id) => MATERIALES[id].nombre);
}
