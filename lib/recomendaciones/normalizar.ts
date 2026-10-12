import sinonimosJson from "@/datos/sinonimos.json";
import { esMedida, limpiarMedida, unificarMedidas } from "./medidas";

// Normalización compartida: el MISMO proceso se aplica al nombre de cada producto y a lo que escribe el cliente,
// así "Tornillos 1/4 pulg", "tornillo ¼" y "TORNILLO 1/4"" terminan en las mismas palabras clave: ["tornillo", "1/4"].
//
// Pasos: minúsculas → sin acentos → medidas unificadas → palabras → raíz (singular) → sin palabras vacías → sinónimos.

/** Palabras que no ayudan a buscar (ya pasadas por raiz(): "unos" → "uno"). */
const PALABRAS_VACIAS = new Set([
  "de", "del", "la", "las", "el", "los", "lo", "para", "par", "con", "sin", "y", "o", "u", "e",
  "en", "un", "una", "uno", "x", "por", "al", "a",
]);

/** Minúsculas, sin acentos ni diéresis (la ñ queda como n, igual en productos y búsquedas). */
export function sinAcentos(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Raíz de la palabra, igual en singular y en plural: se quita la "s" final y luego una "e" final.
 * tornillo/tornillos → tornillo, cable/cables → cabl, conexion/conexiones → conexion, luz/luces → luz.
 * No es gramática perfecta, pero producto y búsqueda pasan por la misma regla, así que siempre coinciden.
 * (Para mostrar una palabra al cliente, como en "¿Quisiste decir…?", se usa la palabra original del catálogo.)
 */
export function raiz(palabra: string): string {
  if (palabra.length <= 3 || !/^[a-z]+$/.test(palabra)) return palabra;
  if (palabra.endsWith("ces")) return palabra.slice(0, -3) + "z";
  let r = palabra;
  if (r.endsWith("s") && !r.endsWith("ss")) r = r.slice(0, -1);
  if (r.length > 4 && r.endsWith("e")) r = r.slice(0, -1);
  return r;
}

/** Texto → palabras clave, SIN aplicar sinónimos. */
function palabrasBase(texto: string): string[] {
  const unificado = unificarMedidas(sinAcentos(texto));
  return unificado
    .split(/[^a-z0-9/".-]+/)
    .map((p) => p.replace(/^[-.]+|[-.]+$/g, ""))
    .filter(Boolean)
    .map((p) => (esMedida(p) ? limpiarMedida(p) : raiz(p.replace(/"/g, ""))))
    .filter((p) => p && !PALABRAS_VACIAS.has(p));
}

type Reemplazo = { desde: string[]; hacia: string[] };

let reemplazos: Map<string, Reemplazo[]> | null = null;

/** Prepara el diccionario de sinónimos una sola vez: cada variante apunta a la palabra principal de su grupo. */
function tablaSinonimos(): Map<string, Reemplazo[]> {
  if (reemplazos) return reemplazos;
  const tabla = new Map<string, Reemplazo[]>();
  for (const grupo of (sinonimosJson as { grupos: string[][] }).grupos) {
    const [principal, ...variantes] = grupo.map(palabrasBase);
    if (!principal?.length) continue;
    for (const desde of variantes) {
      if (!desde.length) continue;
      const lista = tabla.get(desde[0]) ?? [];
      lista.push({ desde, hacia: principal });
      tabla.set(desde[0], lista);
    }
  }
  // Primero las frases más largas: "llave inglesa" antes que "llave".
  for (const lista of tabla.values()) lista.sort((a, b) => b.desde.length - a.desde.length);
  reemplazos = tabla;
  return tabla;
}

function aplicarSinonimos(palabras: string[]): string[] {
  const tabla = tablaSinonimos();
  const salida: string[] = [];
  for (let i = 0; i < palabras.length; ) {
    const opcion = tabla
      .get(palabras[i])
      ?.find(({ desde }) => desde.every((p, j) => palabras[i + j] === p));
    if (opcion) {
      salida.push(...opcion.hacia);
      i += opcion.desde.length;
    } else {
      salida.push(palabras[i]);
      i += 1;
    }
  }
  return salida;
}

// Las marcas, subcategorías y búsquedas se repiten mucho: se recuerdan los últimos resultados.
const memoria = new Map<string, string[]>();
const MEMORIA_MAXIMA = 5000;

/** Texto (nombre de producto o búsqueda) → palabras clave normalizadas. */
export function palabrasClave(texto: string): string[] {
  const guardado = memoria.get(texto);
  if (guardado) return guardado;
  const palabras = aplicarSinonimos(palabrasBase(texto));
  if (memoria.size >= MEMORIA_MAXIMA) memoria.clear();
  memoria.set(texto, palabras);
  return palabras;
}

export { esMedida };
