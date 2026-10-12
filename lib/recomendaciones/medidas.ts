// Unifica cómo se escriben las medidas, para que 1/4, 1/4", ¼, "un cuarto", 1/4 pulg y 2/8" sean lo mismo.
// Trabaja sobre texto ya en minúsculas y sin acentos (ver normalizar.ts).
//
// Formas finales:
//   fracciones de pulgada  → "1/4", "3/8" (sin comillas; reducidas: 2/4 → 1/2)
//   pulgada y fracción     → "1-1/2"
//   pulgadas enteras       → "2pulg"
//   número con unidad      → "5m", "42.5kg", "12w", "20a", "1/4gal"

const FRACCIONES_UNICODE: Record<string, string> = {
  "¼": " 1/4",
  "½": " 1/2",
  "¾": " 3/4",
  "⅛": " 1/8",
  "⅜": " 3/8",
  "⅝": " 5/8",
  "⅞": " 7/8",
};

/** Medidas dichas con palabras. El orden importa: primero las frases más largas. */
const EN_PALABRAS: [RegExp, string][] = [
  [/\buna? pulgada y media\b/g, ' 1 1/2"'],
  [/\bmedia pulgada\b/g, ' 1/2"'],
  [/\buna pulgada\b/g, ' 1"'],
  [/\bun octavo\b/g, " 1/8"],
  [/\btres octavos\b/g, " 3/8"],
  [/\bcinco octavos\b/g, " 5/8"],
  [/\bsiete octavos\b/g, " 7/8"],
  [/\bun cuarto\b/g, " 1/4"],
  [/\btres cuartos\b/g, " 3/4"],
];

/** Unidades: cómo se pueden escribir → cómo quedan. */
const UNIDADES: [string[], string][] = [
  [["pulgadas", "pulgada", "pulg", "plg"], '"'],
  [["metros", "metro", "mts", "mt"], "m"],
  [["milimetros", "milimetro", "mm"], "mm"],
  [["centimetros", "centimetro", "cm"], "cm"],
  [["kilogramos", "kilogramo", "kilos", "kilo", "kgs", "kg"], "kg"],
  [["gramos", "gramo", "grs", "gr"], "g"],
  [["mililitros", "mililitro", "ml"], "ml"],
  [["litros", "litro", "lts", "lt"], "l"],
  [["galones", "galon", "gal", "gl"], "gal"],
  [["watts", "watt", "vatios", "vatio"], "w"],
  [["voltios", "voltio"], "v"],
  [["amperios", "amperio", "amp"], "a"],
  [["onzas", "onza", "oz"], "oz"],
];

const NUMERO = String.raw`(\d+(?:\.\d+)?(?:\/\d+)?)`;
const variantes = UNIDADES.flatMap(([formas]) => formas).sort((a, b) => b.length - a.length);
const canonica = new Map(UNIDADES.flatMap(([formas, final]) => formas.map((f) => [f, final] as const)));

// "5 metros", "1/4 de pulgada", "42.5 kg" (con espacio: solo unidades de 2 letras o más).
const UNIDAD_SEPARADA = new RegExp(String.raw`${NUMERO}\s*(?:de\s+)?(${variantes.join("|")})\b`, "g");
// "12w", "20a", "220v": letras sueltas solo pegadas al número.
const UNIDAD_PEGADA = /(\d)(w|v|a|m|l|g)\b/g;

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

function reducir(numerador: number, denominador: number): string {
  if (!denominador) return `${numerador}`;
  const d = mcd(numerador, denominador);
  return `${numerador / d}/${denominador / d}`;
}

/** Reescribe las medidas del texto (minúsculas, sin acentos) en su forma única. */
export function unificarMedidas(texto: string): string {
  let t = texto;
  for (const [simbolo, fraccion] of Object.entries(FRACCIONES_UNICODE)) t = t.replaceAll(simbolo, fraccion);
  for (const [patron, medida] of EN_PALABRAS) t = t.replace(patron, medida);
  t = t
    .replace(/[“”″]/g, '"')
    .replace(/(\d),(\d)/g, "$1.$2") // 42,5 → 42.5
    .replace(/#(\d)/g, "$1") // calibre #12 → 12
    .replace(/(\d)\s*[x×]\s*(?=\d)/g, "$1 x ") // 6x1" → 6 x 1"
    .replace(/(\d)°/g, "$1");
  t = t.replace(UNIDAD_SEPARADA, (_, numero: string, unidad: string) => `${numero}${canonica.get(unidad) ?? unidad}`);
  t = t.replace(UNIDAD_PEGADA, "$1$2");
  // "1 1/2" o "1-1/2" → "1-1/2" (una sola medida).
  // El número entero no puede venir pegado a otra medida ("1/2 3/4" son dos medidas).
  t = t.replace(/(?<![\d/.-])(\d+)[\s-]+(\d+)\/(\d+)/g, (_, entero: string, n: string, d: string) => `${entero}-${reducir(+n, +d)}`);
  // Fracciones sueltas reducidas: 2/4 → 1/2.
  t = t.replace(/(^|[^\d-])(\d+)\/(\d+)/g, (_, antes: string, n: string, d: string) => `${antes}${reducir(+n, +d)}`);
  return t;
}

/** Limpia una palabra que ya pasó por unificarMedidas: 1/4" → 1/4, 2" → 2pulg. */
export function limpiarMedida(palabra: string): string {
  const conPulgadas = palabra.endsWith('"');
  const sola = palabra.replace(/"+/g, "");
  if (conPulgadas && /^\d+(\.\d+)?$/.test(sola)) return `${sola}pulg`;
  return sola;
}

/** Toda palabra que empieza con un número es una medida (1/4, 2pulg, 5m, 12w, 15). */
export function esMedida(palabra: string): boolean {
  return /^\d/.test(palabra);
}
