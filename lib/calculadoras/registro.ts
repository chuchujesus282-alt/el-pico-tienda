import { bloques } from "./bloques";
import { cabillas } from "./cabillas";
import { ceramica } from "./ceramica";
import { concreto } from "./concreto";
import { contrapiso } from "./contrapiso";
import { drywall } from "./drywall";
import { friso } from "./friso";
import { impermeabilizacion } from "./impermeabilizacion";
import { pintura } from "./pintura";
import { techo } from "./techo";
import type { Calculadora, Entrada, GrupoOpciones, OpcionCalculadora } from "./tipos";

// Lista de calculadoras, en el orden en que salen en /calculadoras.
// Para agregar una: crea su archivo (como bloques.ts) y súmala aquí. Nada más.
export const CALCULADORAS: Calculadora[] = [
  bloques,
  concreto,
  friso,
  cabillas,
  pintura,
  ceramica,
  contrapiso,
  techo,
  impermeabilizacion,
  drywall,
];

export function obtenerCalculadora(slug: string): Calculadora | undefined {
  return CALCULADORAS.find((c) => c.slug === slug);
}

/** true si la opción se ofrece con lo que está elegido en los demás grupos (ver `soloCon`). */
export function opcionDisponible(opcion: OpcionCalculadora, opciones: Entrada["opciones"]): boolean {
  return Object.entries(opcion.soloCon ?? {}).every(([grupo, valores]) => valores.includes(opciones[grupo]));
}

/** Las opciones de un grupo que se ofrecen con lo elegido en los demás. */
export function opcionesDisponibles(grupo: GrupoOpciones, opciones: Entrada["opciones"]): OpcionCalculadora[] {
  return grupo.opciones.filter((o) => opcionDisponible(o, opciones));
}

/**
 * Si al cambiar un grupo una opción elegida deja de ofrecerse (ej. pasar a arcilla con 20 cm elegido), se cambia por
 * la de defecto del grupo o, si tampoco se ofrece, por la primera que sí.
 */
export function ajustarOpciones(calculadora: Calculadora, opciones: Entrada["opciones"]): Entrada["opciones"] {
  const ajustadas = { ...opciones };
  for (const grupo of calculadora.grupos) {
    const disponibles = opcionesDisponibles(grupo, ajustadas);
    if (disponibles.some((o) => o.valor === ajustadas[grupo.id])) continue;
    ajustadas[grupo.id] = (disponibles.find((o) => o.valor === grupo.defecto) ?? disponibles[0])?.valor ?? grupo.defecto;
  }
  return ajustadas;
}

/** Opciones por defecto de una calculadora. */
export function opcionesIniciales(calculadora: Calculadora): Entrada["opciones"] {
  return ajustarOpciones(calculadora, Object.fromEntries(calculadora.grupos.map((g) => [g.id, g.defecto])));
}

/** true si todas las medidas obligatorias son números mayores que cero. */
export function medidasCompletas(calculadora: Calculadora, medidas: Entrada["medidas"]): boolean {
  return calculadora.campos.every((c) => c.opcional || (Number.isFinite(medidas[c.id]) && medidas[c.id] > 0));
}
