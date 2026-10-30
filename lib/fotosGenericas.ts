// Fotos de REFERENCIA para los productos GENERICO de Saint (sin foto propia), una por TIPO de producto: la tienda la
// asigna sola por el comienzo del nombre, así un producto nuevo de ese tipo la recibe sin tocar nada. Las fotos están
// hechas con IA con un mismo estilo (docs/fotos-genericas.md) y viven en public/productos/genericos/.
// Responsable: persona A. Lo llama agrupar() de lib/agrupaciones.ts DESPUÉS de las fotos por código y por nombre de
// persona B: esas siempre mandan. No mueve nada de categoría (Saint manda la clasificación).
// Para sumar un tipo: la foto en public/productos/genericos/<archivo>.webp y una regla aquí (con su prueba).

const G = "/productos/genericos/";

/** Comienzo del nombre en Saint (en MAYÚSCULAS) → foto. Gana la primera que coincide. */
const REGLAS: [RegExp, string][] = [
  // "TOR HEX 8.8, DIN 933 6-1,00x20", "TOR HEX G5NF 3/4-16x1 1/4"" (no "TOR AUTO HEX", que es autorroscante)
  [/^TOR\.?\s+HEX\b/, "tornillo-hexagonal.webp"],
  // "C.BRNCE. CDO 90° DE COMP.", "C.BRNCE.CONEC.MANG ESPG.xNPT…", "C.BRNCE ADAPT.ACETILENO…"
  [/^C\.\s*BRNCE\b/, "conexion-bronce.webp"],
];

/** Foto de referencia de un producto GENERICO por su tipo, o undefined (otra marca, o un tipo sin foto todavía). */
export function fotoGenerica(nombre: string, marca: string | null): string | undefined {
  if ((marca ?? "").trim().toUpperCase() !== "GENERICO") return undefined;
  const n = nombre.trim().replace(/\s+/g, " ").toUpperCase();
  const regla = REGLAS.find(([patron]) => patron.test(n));
  return regla ? G + regla[1] : undefined;
}
