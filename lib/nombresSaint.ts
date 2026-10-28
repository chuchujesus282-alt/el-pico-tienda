// Nombres de Saint (llegan en MAYÚSCULAS) → formato oración legible:
//   "ACESA LLAVE COMBINADA PROFESIONAL  11 mm"  →  "Acesa llave combinada profesional 11 mm"
//   "CMT HOJA DE CALADORA 5 PZAS JT101D"        →  "CMT hoja de caladora 5 pzas JT101D"
// Las medidas y los códigos se respetan tal como vienen (3/4, 6x1,00, 710-3/4, JT101D, T-20, 1500W); solo las
// unidades pegadas a un número van en minúscula (33MM → 33mm). Las siglas y las marcas cortas quedan en mayúscula
// (HSS, PVC, 3M, CMT). Solo se ponen los acentos de una lista de palabras seguras (eléctrico, portátil, medición…).
// El código del producto nunca pasa por aquí.

/** Siglas que siempre van en mayúscula. */
const SIGLAS = new Set([
  "PVC", "CPVC", "LED", "THW", "PPR", "HP", "UV", "USB", "AC", "DC", "HSS", "SDS", "MDF", "NPT", "TCT", "KVA", "CC",
  "RPM", "PSI", "SAE", "TPI", "AWG", "BSP", "CFM", "GLP", "ABS", "BTU", "LCD", "XL", "XXL",
  "II", "III", "IV", "VI", "VII", "VIII", "IX",
]);

/** Unidades que van en minúscula: "5 MTS" → "5 mts", "20PZAS" → "20pzas". */
const UNIDADES = new Set([
  "MM", "CM", "MT", "MTS", "MTRS", "PZ", "PZA", "PZAS", "PZS", "LT", "LTS", "ML", "GR", "GRS", "KG", "KGS", "OZ", "PULG", "GAL",
]);

/** Palabras a las que se les pone el acento (palabra completa; la raíz admite -o, -a, -os, -as). */
const RAICES_CON_ACENTO: [string, string][] = [
  ["ELECTRIC", "eléctric"], ["ELECTRONIC", "electrónic"], ["HIDRAULIC", "hidráulic"], ["NEUMATIC", "neumátic"],
  ["METALIC", "metálic"], ["AUTOMATIC", "automátic"], ["MAGNETIC", "magnétic"], ["PLASTIC", "plástic"],
  ["ECONOMIC", "económic"], ["TECNIC", "técnic"], ["MECANIC", "mecánic"], ["METALMECANIC", "metalmecánic"],
  ["METRIC", "métric"], ["AMPERIMETRIC", "amperimétric"], ["CERAMIC", "cerámic"], ["TERMIC", "térmic"],
  ["RAPID", "rápid"], ["PRACTIC", "práctic"], ["ELASTIC", "elástic"], ["OPTIC", "óptic"], ["UNIC", "únic"],
  ["QUIMIC", "químic"], ["ARQUITECTONIC", "arquitectónic"],
  ["DIAGNOSTIC", "diagnóstic"], ["ASFALTIC", "asfáltic"], ["MILIMETRIC", "milimétric"], ["CILINDRIC", "cilíndric"],
  ["CONCENTRIC", "concéntric"], ["TELEFONIC", "telefónic"], ["TERMOMAGNETIC", "termomagnétic"],
  ["ELECTRODOMESTIC", "electrodoméstic"], ["DOMESTIC", "doméstic"], ["HIGIENIC", "higiénic"], ["MURIATIC", "muriátic"],
  ["INALAMBRIC", "inalámbric"], ["TELESCOPIC", "telescópic"], ["EPOXIC", "epóxic"],
];
const PALABRAS_CON_ACENTO: Record<string, string> = {
  PORTATIL: "portátil", PORTATILES: "portátiles", MEDICION: "medición", COMBUSTION: "combustión", CARBON: "carbón",
  UNION: "unión", CONEXION: "conexión", EXTENSION: "extensión", PRESION: "presión", NUMERO: "número",
  MAQUINA: "máquina", MAQUINAS: "máquinas", LAMINA: "lámina", LAMINAS: "láminas", BATERIA: "batería",
  BATERIAS: "baterías", ESTRIA: "estría", CAMARA: "cámara", PROTECCION: "protección", FIJACION: "fijación",
  SUJECION: "sujeción", DIAMETRO: "diámetro", ANGULO: "ángulo", TUBERIA: "tubería", SEÑALIZACION: "señalización",
  JARDIN: "jardín", ESPATULA: "espátula", ESPATULAS: "espátulas", ESTANDAR: "estándar", MULTIMETRO: "multímetro",
  TERMOMETRO: "termómetro", MANOMETRO: "manómetro", VALVULA: "válvula", VALVULAS: "válvulas",
  // Nombres de subcategorías de Saint (2026-10-28)
  CONSTRUCCION: "construcción", TORNILLERIA: "tornillería", CERRAJERIA: "cerrajería", GRIFERIA: "grifería",
  INSTALACION: "instalación", ILUMINACION: "iluminación", DESAGUE: "desagüe", AREA: "área", AREAS: "áreas",
  VEHICULO: "vehículo", VEHICULOS: "vehículos",
  // Niveles del árbol de subcategorías de Saint (2026-10-28)
  TAPICERIA: "tapicería", JARDINERIA: "jardinería", CARPINTERIA: "carpintería", ALBAÑILERIA: "albañilería",
  CAÑERIA: "cañería", CAÑERIAS: "cañerías", ESTANTERIA: "estantería", ESTANTERIAS: "estanterías", TUBERIAS: "tuberías",
  JABON: "jabón", JABONES: "jabones", ENERGIA: "energía", BUJIA: "bujía", BUJIAS: "bujías", FRIA: "fría", FRIO: "frío",
  LASER: "láser", SILICON: "silicón", TRAFICO: "tráfico", ANGULOS: "ángulos", FOTOCELULA: "fotocélula",
  FOTOCELULAS: "fotocélulas", MANOMETROS: "manómetros", TERMOMETROS: "termómetros", MULTIMETROS: "multímetros",
  TORQUIMETRO: "torquímetro", TORQUIMETROS: "torquímetros", AMPERIMETRO: "amperímetro", AMPERIMETROS: "amperímetros",
  VOLTIMETRO: "voltímetro", VOLTIMETROS: "voltímetros",
};

/** Después de estas palabras, una letra suelta es un tipo o modelo y queda en mayúscula: TIPO A, MOD B. */
const ANTES_DE_LETRA = new Set(["TIPO", "MOD", "MOD.", "MODELO", "TALLA", "SERIE", "CLASE"]);

const tieneVocal = (texto: string) => /[AEIOUÁÉÍÓÚ]/.test(texto);
const LETRAS = /[A-ZÑÁÉÍÓÚÜ]+/g;

function conAcento(palabra: string): string | undefined {
  if (PALABRAS_CON_ACENTO[palabra]) return PALABRAS_CON_ACENTO[palabra];
  // Toda palabra terminada en -CION o -SION lleva tilde: protección, nivelación, compresión, termofusión…
  const sufijo = palabra.match(/^([A-ZÑ]{3,})([CS])ION$/);
  if (sufijo) return `${sufijo[1].toLowerCase()}${sufijo[2].toLowerCase()}ión`;
  for (const [raiz, conTilde] of RAICES_CON_ACENTO) {
    const fin = palabra.slice(raiz.length);
    if (palabra.startsWith(raiz) && ["O", "A", "OS", "AS"].includes(fin)) return conTilde + fin.toLowerCase();
  }
  return undefined;
}

/** Una palabra sin números: sigla, unidad o palabra común (con su acento si está en la lista). */
function formatearLetras(palabra: string): string {
  if (UNIDADES.has(palabra)) return palabra.toLowerCase();
  if (SIGLAS.has(palabra)) return palabra;
  // Sin vocales y de 2+ letras es una sigla o un código (CMT, DST, NC): se deja igual.
  if (palabra.length >= 2 && !tieneVocal(palabra)) return palabra;
  return conAcento(palabra) ?? palabra.toLowerCase();
}

/**
 * Una palabra con números (medida o código) se deja como viene de Saint (6x1,00, JT101D, T-20, 1500W, GHOCM6), salvo
 * las unidades pegadas a un número (33MM → 33mm, 20PZAS → 20pzas) y una abreviatura al comienzo seguida de punto
 * ("ESTR.3/4" → "estr.3/4").
 */
function formatearMedida(palabra: string): string {
  return palabra.replace(LETRAS, (letras: string, posicion: number) => {
    const antes = palabra[posicion - 1];
    const despues = palabra[posicion + letras.length];
    if (UNIDADES.has(letras) && antes !== undefined && /[\d.]/.test(antes)) return letras.toLowerCase();
    if (posicion === 0 && despues === "." && letras.length >= 3 && tieneVocal(letras) && !SIGLAS.has(letras)) {
      return conAcento(letras) ?? letras.toLowerCase();
    }
    return letras;
  });
}

function formatearPalabra(original: string, anterior?: string): string {
  if (/\d/.test(original)) return formatearMedida(original);
  const palabra = original.toUpperCase();
  // TIPO "C", TIPO A, MOD B: la letra es un modelo.
  if (/^"[A-Z]"$/.test(palabra)) return palabra;
  if (/^[A-Z]$/.test(palabra) && anterior && ANTES_DE_LETRA.has(anterior.toUpperCase())) return palabra;
  // "P/JARDIN", "C/LLAVE", "GRUESO/FINO": cada parte por separado.
  return palabra.replace(LETRAS, (parte) => formatearLetras(parte));
}

/** Marca: las cortas o con números/guiones quedan en mayúscula (3M, CMT, UNI-T); las demás, "Acesa", "Palma real". */
function formatearMarca(palabras: string[]): string[] {
  return palabras.map((palabra, i) => {
    if (/[\d-]/.test(palabra) || palabra.length <= 3 || !tieneVocal(palabra)) return palabra;
    return palabra.replace(LETRAS, (parte: string, posicion: number) =>
      i === 0 && posicion === 0 ? parte.charAt(0) + parte.slice(1).toLowerCase() : parte.toLowerCase(),
    );
  });
}

/** "ACESA LLAVE COMBINADA PROFESIONAL  11 mm" (+ marca "ACESA") → "Acesa llave combinada profesional 11 mm". */
export function nombreLegible(nombre: string, marca?: string | null): string {
  // Sin pasar todo a mayúscula: las medidas quedan como vienen ("6x1,00").
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "";

  // Si el nombre empieza con la marca ("ACESA DADO…", "STANLEY/LAZER…"), esas palabras se escriben como marca.
  const palabrasMarca = marca && marca.trim() !== "S/M" ? marca.toUpperCase().trim().split(/\s+/) : [];
  let largoMarca = 0;
  if (palabrasMarca.length > 0) {
    if (palabrasMarca.every((p, i) => palabras[i]?.toUpperCase() === p)) largoMarca = palabrasMarca.length;
    else if (palabrasMarca.length === 1 && palabras[0].toUpperCase().startsWith(`${palabrasMarca[0]}/`)) largoMarca = 1;
  }

  const resultado = [
    ...formatearMarca(palabras.slice(0, largoMarca).map((p) => p.toUpperCase())),
    ...palabras.slice(largoMarca).map((p, i) => formatearPalabra(p, palabras[largoMarca + i - 1])),
  ];
  // Primera letra en mayúscula (la marca ya viene armada).
  if (largoMarca === 0) resultado[0] = resultado[0].charAt(0).toUpperCase() + resultado[0].slice(1);
  return resultado.join(" ");
}
