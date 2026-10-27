// Grupos de productos GENÉRICOS de Saint (sin marca importante: en Saint su "marca" es TORNERIA, TORNILLOS, RETEN…,
// un tipo y no una marca). PRUEBA de persona B (2026-10-26): agruparlos por medida, como las llaves combinadas, y
// ponerles una foto con fondo blanco. Hoy van SIN foto (ícono de la subcategoría): las fotos libres que se
// encontraron no servían; al tener una, va en public/productos/genericos/{nombre}.webp y su nombre en FOTOS_LISTAS
// (con autor y licencia en public/productos/CREDITOS.md si no es propia). Lo usa lib/agrupaciones.ts; las pruebas están en lib/__tests__/agrupaciones.test.ts.
//
// Cada regla lee el nombre de Saint (en MAYÚSCULAS) y devuelve grupo + etiqueta (+ sección propia si hace falta).
// `undefined` = el producto no es de estas familias (sigue con las reglas de llaves y dados); `null` = sí, pero queda
// suelto (no se le pudo leer la medida, o es de una marca: esas no entran en la prueba).

/** `detalle`: lo que va después del título en el nombre de la medida, si no es la etiqueta del botón. */
type Resultado = { grupo: string; etiqueta: string; encastre: null; seccion?: string; detalle?: string };
type Leer = (texto: string) => string | null;

const F = "/productos/genericos/";
/** Fotos ya elegidas (public/productos/genericos/{nombre}.webp). Las demás familias van con el ícono de la subcategoría. */
const FOTOS_LISTAS = new Set<string>([]); // todavía ninguna: la prueba con fotos libres quedó pendiente
const foto = (nombre: string) => (FOTOS_LISTAS.has(nombre) ? `${F}${nombre}.webp` : null);

/**
 * Definición de los grupos genéricos (mismo formato que GRUPOS de lib/agrupaciones.ts). Todos sin marca en la tarjeta.
 * `imagen: null` = no se encontró una foto libre con fondo blanco que sirva: va con el ícono de la subcategoría.
 */
export const GRUPOS_GENERICOS = {
  "mecha-hierro-hss": { titulo: "Mecha para hierro HSS", imagen: foto("mecha-hierro"), seccion: "sistema", sinMarca: true },
  "mecha-hierro-hss-corta": { titulo: "Mecha para hierro HSS corta calibrada", imagen: foto("mecha-hierro"), seccion: null, sinMarca: true },
  "mecha-concreto-economica": { titulo: "Mecha para concreto económica", imagen: foto("mecha-concreto"), seccion: null, sinMarca: true },
  "mecha-concreto-calidad": { titulo: "Mecha para concreto de calidad", imagen: foto("mecha-concreto"), seccion: null, sinMarca: true },
  "mecha-concreto-larga": { titulo: "Mecha para concreto larga", imagen: foto("mecha-concreto"), seccion: "propia", sinMarca: true, seccionEnTitulo: true },
  "mecha-cobalto": { titulo: "Mecha de cobalto", imagen: foto("mecha-cobalto"), seccion: null, sinMarca: true },
  "mecha-widia": { titulo: "Mecha widia", imagen: foto("mecha-concreto"), seccion: null, sinMarca: true },
  "mecha-vidrio": { titulo: "Mecha para vidrio", imagen: foto("mecha-vidrio"), seccion: null, sinMarca: true },
  "mecha-reducida": { titulo: "Mecha reducida HSS", imagen: foto("mecha-reducida"), seccion: null, sinMarca: true },
  "mecha-extra-larga": { titulo: "Mecha extra larga", imagen: foto("mecha-hierro"), seccion: null, sinMarca: true },
  rolinera: { titulo: "Rolinera", imagen: foto("rolinera"), seccion: "propia", sinMarca: true },
  reten: { titulo: "Retén", imagen: foto("reten"), seccion: "propia", sinMarca: true },
  "juego-machos": { titulo: "Juego de machos", imagen: foto("macho"), seccion: "propia", sinMarca: true },
  "pasador-presion": { titulo: "Pasador de presión", imagen: foto("pasador"), seccion: "propia", sinMarca: true },
  "lima-triangular": { titulo: "Lima triangular", imagen: foto("lima-triangular"), seccion: null, sinMarca: true },
  "lima-redonda": { titulo: "Lima redonda", imagen: foto("lima-redonda"), seccion: null, sinMarca: true },
  "cuchara-albanil": { titulo: "Cuchara de albañil", imagen: foto("cuchara"), seccion: "propia", sinMarca: true, seccionEnTitulo: true },
  "mazo-goma": { titulo: "Mazo de goma", imagen: foto("mazo"), seccion: "propia", sinMarca: true, seccionEnTitulo: true },
  "llave-cruz": { titulo: "Llave de cruz", imagen: foto("llave-cruz"), seccion: null, sinMarca: true },
  "cepillo-copa": { titulo: "Cepillo de copa", imagen: foto("cepillo-copa"), seccion: null, sinMarca: true },
  "porta-electrodo": { titulo: "Pinza porta electrodo", imagen: foto("porta-electrodo"), seccion: null, sinMarca: true },
  "correa-a": { titulo: "Correa industrial tipo A", imagen: foto("correa"), seccion: null, sinMarca: true },
  "correa-b": { titulo: "Correa industrial tipo B", imagen: foto("correa"), seccion: null, sinMarca: true },
} satisfies Record<string, { titulo: string; imagen: string | null; seccion: "sistema" | "propia" | null; sinMarca: boolean; seccionEnTitulo?: boolean }>;

/** Orden de las secciones propias en el selector (las que no están aquí van por su número). */
export const ORDEN_SECCIONES = [
  "Miniatura",
  "Métrico",
  "Rosca gruesa NC",
  "Rosca fina NF",
  "Económica",
  "De calidad",
  "Punta redonda",
  "Punta cuadrada",
  "Punta redonda y cuadrada",
  "Cabo metálico",
  "Económico",
];

/** Marcas reales que NO entran en la prueba de genéricos aunque el nombre coincida. */
const MARCAS_EXCLUIDAS = /NICHOL|MILWAUKEE|STANLEY|TRUPER|BELLOTA|BAHCO|BOSCH/;

/** "12MM O 1/2" → '12 mm / 1/2"'; "13/64 Y 11/64" → '13/64" / 11/64"'. */
function varias(texto: string, leer: Leer): string | null {
  const partes = texto
    .split(/\s+(?:Y|O|Ó)\s+/)
    .map((t) => leer(t))
    .filter((t): t is string => !!t);
  return partes.length ? partes.join(" / ") : null;
}

const con = (grupo: string, etiqueta: string | null, seccion?: string): Resultado | null =>
  etiqueta ? { grupo, etiqueta, encastre: null, ...(seccion ? { seccion } : {}) } : null;

/** Fracción con comillas: "1/4" → '1/4"'. */
const pulg = (f: string) => `${f}"`;

/** Grupo genérico del producto. undefined: no es de estas familias. */
export function clasificarGenerico(n: string, marca: string | null, leer: Leer): Resultado | null | undefined {
  let m: RegExpMatchArray | null;
  const excluida = marca !== null && MARCAS_EXCLUIDAS.test(marca.toUpperCase());

  // ---- Mechas (en Saint, marca "TORNERIA")
  if ((m = n.match(/^MECHA PARA HIERRO HSS (.+)$/))) return con("mecha-hierro-hss", leer(m[1]));
  if ((m = n.match(/^MECHA P\/HIERRO HSS (\S+) CORTO CALIBRADA/))) return con("mecha-hierro-hss-corta", leer(m[1]));
  if ((m = n.match(/^MECHA P\/CONCRETO CHINA (.+)$/))) return con("mecha-concreto-economica", varias(m[1], leer));
  if ((m = n.match(/^MECHA P\/CONCRETO CALIDAD (.+)$/))) {
    const r = m[1].match(/^(\S+) RED (\S+)$/); // "1/2 RED 3/8": mecha de 1/2" con espiga reducida a 3/8"
    return con("mecha-concreto-calidad", r ? `${leer(r[1])} (espiga ${leer(r[2])})` : varias(m[1].replace(/"/g, ""), leer));
  }
  if ((m = n.match(/^MECHA P\/CONCRETO (\S+) LARGA (DE CALIDAD|ECONOMICA)$/)))
    return con("mecha-concreto-larga", leer(m[1]), m[2] === "ECONOMICA" ? "Económica" : "De calidad");
  if (/^MECHA P\/CONCRETO /.test(n)) return null; // SDS Milwaukee y demás: sueltas
  if ((m = n.match(/^MECHA COBALTO (.+)$/))) return con("mecha-cobalto", varias(m[1], leer));
  if ((m = n.match(/^MECHAS WIDIA (.+)$/))) return con("mecha-widia", varias(m[1], leer));
  if ((m = n.match(/^MECHA P\/VIDRIO (.+)$/))) return con("mecha-vidrio", varias(m[1], leer));
  if ((m = n.match(/^MECHA REDUCIDA HSS (.+)$/))) return con("mecha-reducida", leer(m[1]));
  if ((m = n.match(/^MECHA EXTRA LARGA (\S+) X (\d+)MM$/))) return con("mecha-extra-larga", `${leer(m[1])} × ${m[2]} mm`);

  // ---- Repuestos
  if ((m = n.match(/^ROLINERA MOD (\d+)[.-]?(.*)$/))) {
    const sello = m[2].replace(/\./g, " ").trim(); // "Z", "RS", "ZZ C3"
    // Las de 3 cifras (607, 626…) son las pequeñas; las de 4, por serie (60xx, 62xx, 63xx…).
    return con("rolinera", `${m[1]}${sello ? ` ${sello}` : ""}`, m[1].length >= 4 ? `Serie ${m[1].slice(0, 2)}` : "Miniatura");
  }
  if ((m = n.match(/^RETEN (INTERNO )?((\d+)-\d+)(?: (\d+-\d+))?$/))) {
    const etiqueta = `${m[2]}${m[4] ? ` / ${m[4]}` : ""}${m[1] ? " interno" : ""}`;
    return con("reten", etiqueta, `Serie ${m[3]}`);
  }
  if ((m = n.match(/^JGO\. MACHO (\d+(?:[.,]\d+)?) ?X ?(\d+(?:[.,]\d+)?)(?: MM)?$/)))
    return con("juego-machos", `M${m[1]} × ${m[2].replace(".", ",")}`, "Métrico");
  if ((m = n.match(/^JGO\. MACHO (NC|NF) (\d+\/\d+)$/)))
    return con("juego-machos", pulg(m[2]), m[1] === "NC" ? "Rosca gruesa NC" : "Rosca fina NF");
  if ((m = n.match(/^PASADOR PRESION (\d+\/\d+)X(.+?)"?$/))) {
    // Botón = el largo (ordenado de menor a mayor dentro de su diámetro); nombre = 'Pasador de presión 1/8" × 1-1/2"'.
    const crudo = m[2].replace(/"/g, "");
    const largo = leer(crudo.includes("/") || crudo.includes("-") ? crudo : `${crudo}"`);
    const r = con("pasador-presion", largo, `Diámetro ${pulg(m[1])}`);
    return r && { ...r, detalle: `${pulg(m[1])} × ${largo}` };
  }

  // ---- Herramientas de mano
  if ((m = n.match(/^LIMA TRIANGULAR (.+)$/))) return excluida ? null : con("lima-triangular", varias(m[1], leer));
  if ((m = n.match(/^LIMA REDONDA (.+)$/))) return excluida ? null : con("lima-redonda", varias(m[1], leer));
  if ((m = n.match(/^CUCHARA PARA ALBANIL PTA\.? (REDONDA|CUADRADA|RED Y CUADR) (\d+)"$/))) {
    const punta = m[1] === "REDONDA" ? "Punta redonda" : m[1] === "CUADRADA" ? "Punta cuadrada" : "Punta redonda y cuadrada";
    return con("cuchara-albanil", `${m[2]}"`, punta);
  }
  if ((m = n.match(/^MAZO DE GOMA (\d+) GRS CABO METALICO$/))) return con("mazo-goma", `${m[1]} g`, "Cabo metálico");
  if ((m = n.match(/^MAZO DE GOMA ECONOMICO DE (\d+) OZ$/))) return con("mazo-goma", `${m[1]} oz`, "Económico");
  if ((m = n.match(/^LLAVE DE CRUZ (\d+)(?:"|·)\s*(PLEGABLE)?$/))) return con("llave-cruz", `${m[1]}"${m[2] ? " plegable" : ""}`);
  if ((m = n.match(/^CEPILLO T\/COPA (ENTORCHADO|BRONCE) (\d+)" CHINO$/)))
    return con("cepillo-copa", `${m[2]}" ${m[1] === "BRONCE" ? "de bronce" : "entorchado"}`);
  if ((m = n.match(/^PINZA PORTA ELECTRODO (\d+)AMP ECONOMICO$/))) return con("porta-electrodo", `${m[1]} A`);
  if ((m = n.match(/^CORREA INDUSTRIAL TIPO ([AB]) MOD (.+)$/))) {
    const modelos = m[2].match(/[AB]-?\d+(?:\.\d+)?/g) ?? [];
    return con(m[1] === "A" ? "correa-a" : "correa-b", modelos.length ? modelos.map((x) => x.replace(/^([AB])-?/, "$1-")).join(" / ") : null);
  }
  return undefined;
}
