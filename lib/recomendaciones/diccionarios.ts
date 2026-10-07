import complementariosJson from "@/datos/complementarios.json";
import consumiblesJson from "@/datos/consumibles.json";
import { palabrasClave } from "./normalizar";
import type { ProductoIndexado } from "./tipos";

// Lee los diccionarios editables de datos/ y los deja normalizados (mismo proceso que los productos),
// así en el JSON da igual escribir "Cuchara de albañil", "cucharas" o un sinónimo.

/** Una frase normalizada que describe un tipo de producto: ["cinta", "aislant"]. */
export type Frase = string[];

/** Hasta qué palabra del nombre puede empezar una frase ("CINTA TEFLON" coincide con "teflon"). */
const POSICION_MAXIMA = 2;

/**
 * ¿El producto es de este tipo? 1 si su nombre empieza con la frase ("RODILLO ANTIGOTA" → rodillo),
 * 0.5 si la frase aparece en las primeras palabras ("JUEGO DE DESTORNILLADORES" → destornillador), 0 si no.
 */
export function coincidencia(producto: ProductoIndexado, frase: Frase): number {
  const { tokens } = producto;
  for (let inicio = 0; inicio <= POSICION_MAXIMA && inicio + frase.length <= tokens.length; inicio++) {
    if (frase.every((p, j) => tokens[inicio + j] === p)) return inicio === 0 ? 1 : 0.5;
  }
  return 0;
}

type Mapa = { tipo: Frase; complementos: Frase[] }[];

let mapa: Mapa | null = null;
let consumibles: Frase[] | null = null;

function mapaComplementarios(): Mapa {
  if (!mapa) {
    const crudo = (complementariosJson as { complementos: Record<string, string[]> }).complementos;
    mapa = Object.entries(crudo)
      .map(([tipo, lista]) => ({ tipo: palabrasClave(tipo), complementos: lista.map(palabrasClave).filter((f) => f.length) }))
      .filter((e) => e.tipo.length)
      // Primero los tipos más específicos: "tubo pvc" antes que "tubo".
      .sort((a, b) => b.tipo.length - a.tipo.length);
  }
  return mapa;
}

/**
 * Frases de lo que se usa junto con este producto, en orden de importancia.
 * Primero lo que dice su propia línea del mapa; después, los tipos que lo nombran a él
 * (si "pintura" lleva "brocha", la brocha sugiere pintura aunque no tenga línea propia).
 */
export function complementosDe(producto: ProductoIndexado): Frase[] {
  const entradas = mapaComplementarios();
  const directa = entradas.find((e) => coincidencia(producto, e.tipo) > 0);
  const inversas = entradas
    .filter((e) => e !== directa && e.complementos.some((f) => coincidencia(producto, f) > 0))
    .map((e) => e.tipo);
  return [...(directa?.complementos ?? []), ...inversas];
}

/** Consumibles (tornillos, cintas, pega…): se pueden volver a sugerir aunque ya estén en el carrito o se hayan pedido. */
export function esConsumible(producto: ProductoIndexado): boolean {
  consumibles ??= (consumiblesJson as { tipos: string[] }).tipos.map(palabrasClave).filter((f) => f.length);
  return consumibles.some((frase) => coincidencia(producto, frase) > 0);
}
