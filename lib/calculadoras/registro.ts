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
import type { Calculadora, Entrada } from "./tipos";

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

/** Opciones por defecto de una calculadora. */
export function opcionesIniciales(calculadora: Calculadora): Entrada["opciones"] {
  return Object.fromEntries(calculadora.grupos.map((g) => [g.id, g.defecto]));
}

/** true si todas las medidas obligatorias son números mayores que cero. */
export function medidasCompletas(calculadora: Calculadora, medidas: Entrada["medidas"]): boolean {
  return calculadora.campos.every((c) => c.opcional || (Number.isFinite(medidas[c.id]) && medidas[c.id] > 0));
}
