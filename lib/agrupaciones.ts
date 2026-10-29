import type { Producto } from "@/types/catalogo";
import { clasificarGenerico, GRUPOS_GENERICOS, ORDEN_SECCIONES } from "@/lib/agrupacionesGenericas";

// Agrupación de productos de Saint que son el MISMO producto en distintas medidas (llave combinada Acesa 8 mm, 10 mm…;
// dados por marca y tipo). En la lista de la categoría cada grupo sale como UNA tarjeta ("Desde $X") y en su página se
// elige la medida (components/producto-detalle/CompraConVariantes.tsx). Cada medida sigue siendo su producto de Saint
// (mismo código y precio): al carrito, a favoritos, al buscador y al WhatsApp va la medida elegida, con un nombre
// claro ("Llave combinada Acesa 10 mm") y la foto del grupo. Lógica pura (sin servidor), con pruebas en
// lib/__tests__/agrupaciones.test.ts. Responsable: persona B.
//
// Para sumar un grupo: una regla en `clasificar()` (por el nombre de Saint, en MAYÚSCULAS) y su entrada en GRUPOS.
// Un grupo con un solo producto no se arma: ese producto sale suelto, como siempre.

/** Foto de cada familia (public/productos/grupos/). */
const FOTO_LLAVE = "/productos/grupos/llave-combinada-cromada.webp";
const FOTO_DADO = "/productos/grupos/dado-cromado.webp"; // solo dados Acesa
const FOTO_DADO_LARGO_STANLEY = "/productos/grupos/dado-largo-stanley.webp"; // hexagonal largo
const FOTO_DADO_LARGO_ESTRIA_STANLEY = "/productos/grupos/dado-largo-estria-stanley.webp";

/** Fotos sueltas por código de Saint (public/productos/{codigo}.webp). */
export const FOTOS_SAINT: Record<string, string> = {
  "3M0015": "/productos/3M0015.webp", // mopa de pulir azul doble cara 8" 3M
  // Pinturas Pineco: fotos oficiales del empaque, una por producto y tamaño (galón o tobo). Los de 1/4 de galón, el
  // Prestige Gold, el Prestige mate en tobo y el Cerami-K siguen sin foto: no llegó la de su empaque.
  PINECO014: "/productos/pineco/PINECO014.webp", // esmalte 2 en 1 acrílico DTM, galón
  PINECO015: "/productos/pineco/PINECO015.webp", // Pípol clase B, galón
  PINECO016: "/productos/pineco/PINECO016.webp", // Pípol clase B, tobo (4 galones)
  PINECO011: "/productos/pineco/PINECO011.webp", // hidroesmalte Prestige clase A, galón
  PINECO002: "/productos/pineco/PINECO002.webp", // Prestige clase A mate, galón
  PINECO003: "/productos/pineco/PINECO003.webp", // Prestige clase A satinado, galón
  PINECO001: "/productos/pineco/PINECO001.webp", // Prestige clase A mate, tobo (4 galones)
  PINECO020: "/productos/pineco/PINECO020.webp", // esmalte 2 en 1 acrílico DTM, 1/4 de galón
  PINECO021: "/productos/pineco/PINECO021.webp", // Cerami-K brillante, 1/4 de galón
  PINECO019: "/productos/pineco/PINECO011.webp", // hidroesmalte 1/4 de galón: la foto del galón (pedido de persona B)
};

/**
 * Fotos de pinturas Montana por su NOMBRE (en Saint, "MONTANA" va solo en la marca): una por línea y acabado.
 * Montafix: en TODOS los que digan Montafix, por su acabado (sin acabado, la brillante), pedido de persona B. Las demás
 * líneas (ABC, AV-2000, Dekoral): en el galón y en el tobo/paila/cuñete (la misma foto); el 1/4 de galón no.
 */
const M = "/productos/montana/";
export function fotoPorNombre(nombre: string, marca: string | null): string | undefined {
  const n = nombre.toUpperCase();
  if (/COLLET/i.test(marca ?? "") || /COLLET/.test(n)) return fotoCollet(n);
  if (!/MONTANA/i.test(marca ?? "") && !/MONTANA/.test(n)) return undefined;
  if (/MONTAFIX/.test(n)) return `${M}${/SATINAD/.test(n) ? "montafix-satinado" : /\bMATE\b/.test(n) ? "montafix-mate" : "montafix-brillante"}.webp`;
  // Galón, y también tobo/paila/cuñete con la misma foto del galón (pedido de persona B: en la foto no se nota). El 1/4 no.
  if (/1\/4/.test(n) || !/\bGAL|TOBO|PAILA|CU[NÑ]ETE/.test(n)) return undefined;
  if (/\bABC\b/.test(n)) return `${M}abc-mate.webp`;
  if (/DEKORAL/.test(n)) return `${M}${/SATINAD/.test(n) ? "dekoral-satinado" : "dekoral-mate"}.webp`;
  if (/AV-? ?2000/.test(n)) {
    if (/BIO/.test(n)) return `${M}av2000-bioprotecto.webp`;
    if (/SEDA/.test(n)) return `${M}av2000-brillo-de-seda.webp`;
    if (/\bEXT/.test(n)) return `${M}av2000-exterior-mate.webp`;
    if (/\bINT/.test(n)) return `${M}av2000-interior-mate.webp`;
  }
  return undefined;
}

/**
 * Collet: Blanco Prestigio (tipo A) y Blanco Ocasión (tipo B) con su propio envase en galón o tobo. TODOS los demás
 * Collet llevan una foto genérica (pedido de persona B): los que empiezan por "Esmalte", la lata negra de esmalte; Decosatín (blanca y azul, tipo A satinada) los satinados y los
 * tipo "A"/"AA"; BasicPlus (blanca y roja) el resto.
 */
const C = "/productos/collet/";
function fotoCollet(n: string): string {
  const linea = /PRESTIG/.test(n) ? "prestigio" : /OCASI/.test(n) ? "ocasion" : null;
  if (linea && !/1\/4/.test(n)) {
    if (/TOBO|CU[NÑ]ETE|PAILA|\b[45] ?GAL/.test(n)) return `${C}${linea}-tobo.webp`;
    if (/\bGAL(ON)?\b/.test(n)) return `${C}${linea}-galon.webp`;
  }
  if (/^(COLLET )?ESMALTE/.test(n)) return `${C}esmalte.webp`;
  if (/SATIN|"A{1,2}"|TIPO A\b/.test(n)) return `${C}decosatin.webp`;
  return `${C}basicplus.webp`;
}

/** Cómo se dividen las medidas en el selector: milímetros/pulgadas, encastre del dado, o una sección propia que da la
 * regla de cada producto ("Punta redonda", "Rosca fina NF", 'Diámetro 1/4"'…). */
type Seccion = "sistema" | "encastre" | "propia";

/**
 * Definición de cada grupo: título que se muestra, foto y cómo se ordenan sus medidas. `imagen: null`: sin foto (la
 * tarjeta muestra el ícono de la subcategoría). Cada foto es SOLO de su marca y tipo (pedido de persona B): la del dado
 * cromado, de los Acesa; las de los dados largos Stanley, una para el de estría y otra para el hexagonal; los demás dados van sin
 * foto hasta tener la suya.
 * `sinMarca`: la tarjeta no muestra marca (en Saint vienen "CHINO", "DADO CHINO" o vacía).
 */
type DefGrupo = {
  titulo: string;
  imagen: string | null;
  seccion: Seccion | null;
  sinMarca?: boolean;
  /** El nombre de cada medida lleva también su sección: 'Cuchara de albañil 8" punta redonda'. */
  seccionEnTitulo?: boolean;
};
const GRUPOS: Record<string, DefGrupo> = {
  "llave-combinada-acesa": { titulo: "Llave combinada Acesa", imagen: FOTO_LLAVE, seccion: "sistema" },
  "dado-acesa": { titulo: "Dado Acesa", imagen: FOTO_DADO, seccion: "encastre" },
  "dado-economico": { titulo: "Dado económico", imagen: null, seccion: "encastre", sinMarca: true },
  "dado-economico-largo": { titulo: "Dado largo económico", imagen: null, seccion: "encastre", sinMarca: true },
  "dado-magnetico-ferrezaga": { titulo: "Dado magnético Ferrezaga 45 mm", imagen: null, seccion: null },
  "dado-proto": { titulo: "Dado estándar Proto", imagen: null, seccion: "encastre" },
  "dado-largo-proto": { titulo: "Dado largo Proto", imagen: null, seccion: "encastre" },
  "dado-estria-corto-stanley": { titulo: "Dado de estría corto Stanley", imagen: null, seccion: "encastre" },
  "dado-estria-largo-stanley": { titulo: "Dado de estría largo Stanley", imagen: FOTO_DADO_LARGO_ESTRIA_STANLEY, seccion: "encastre" },
  "dado-hexagonal-corto-stanley": { titulo: "Dado hexagonal corto Stanley", imagen: null, seccion: "encastre" },
  "dado-hexagonal-largo-stanley": { titulo: "Dado hexagonal largo Stanley", imagen: FOTO_DADO_LARGO_STANLEY, seccion: "encastre" },
  "dado-encastre-3-4-stanley": { titulo: 'Dado Stanley de encastre 3/4"', imagen: null, seccion: null },
  "dado-punta-stanley": { titulo: "Dado de punta Stanley", imagen: null, seccion: "encastre" },
  "dado-torx-stanley": { titulo: "Dado torx Stanley", imagen: null, seccion: "encastre" },
  "dado-hexagonal-corto-promaker": { titulo: "Dado hexagonal corto Stanley Promaker", imagen: null, seccion: "encastre" },
  // Genéricos sin marca importante (lib/agrupacionesGenericas.ts): agrupados por medida, por ahora sin foto.
  ...GRUPOS_GENERICOS,
};

/** Prefijo de los ids de grupo (así nunca chocan con un código de Saint). */
export const PREFIJO_GRUPO = "grupo-";
export const esIdGrupo = (id: string) => id.startsWith(PREFIJO_GRUPO);

export type Variante = {
  /** Código de Saint de esta medida. */
  id: string;
  /** Lo que dice el botón: "10 mm", '9/16"', "T25". */
  etiqueta: string;
  /** Encabezado de su fila en el selector ('Encastre 1/2"', "Milímetros"); null si el grupo no se divide. */
  seccion: string | null;
  producto: Producto;
};

export type Grupo = {
  id: string;
  titulo: string;
  /** Tarjeta del grupo en la lista: precio = el más bajo, `variantes` = cuántas medidas. */
  tarjeta: Producto;
  variantes: Variante[];
};

// ---------- leer medidas de los nombres de Saint ----------

/** Encastre de un dado (1/4", 3/8", 1/2", 3/4"): la primera de esas fracciones en el nombre. */
const ENCASTRE = /(?<![\d/])(1\/4|3\/8|1\/2|3\/4)(?![\d/])"?/;
const ORDEN_ENCASTRE = ["1/4", "3/8", "1/2", "3/4"];

/** "15MM" → "15 mm"; "1.1/4" / "1 1/4" → '1-1/4"'; "9/16" → '9/16"'; "T-30S" → "T30 seguridad"; "E18" → "E18". */
export function leerMedida(texto: string): string | null {
  // "10,5 mm" → 10.5 (decimales con coma, como vienen en Saint).
  const t = texto.trim().toUpperCase().replace(/(\d),(\d)/g, "$1.$2");
  let m: RegExpMatchArray | null;
  const mm = (n: string) => `${String(Number(n)).replace(".", ",")} mm`;
  if ((m = t.match(/^T-?(\d+)(S?)\b/))) return `T${m[1]}${m[2] ? " seguridad" : ""}`;
  if ((m = t.match(/^E(\d+)\b/))) return `E${m[1]}`;
  if ((m = t.match(/^(\d+)[ .-](\d+\/\d+)/))) return `${m[1]}-${m[2]}"`;
  if ((m = t.match(/^(\d+\/\d+)/))) return `${m[1]}"`;
  if ((m = t.match(/^(\d+(?:\.\d+)?)\s*M{1,2}\b/))) return mm(m[1]);
  if ((m = t.match(/^(\d+(?:\.\d+)?)"/))) return `${Number(m[1])}"`; // pulgadas enteras: 10"
  if ((m = t.match(/^(\d+(?:\.\d+)?)(?![\d/])/))) return mm(m[1]);
  return null;
}

/** Valor para ordenar las medidas de menor a mayor (en mm; torx y hembra al final, por su número). */
export function valorMedida(etiqueta: string): number {
  let m: RegExpMatchArray | null;
  if ((m = etiqueta.match(/^(\d+(?:[.,]\d+)?) mm/))) return Number(m[1].replace(",", "."));
  if ((m = etiqueta.match(/^(\d+(?:\.\d+)?)"/))) return Number(m[1]) * 25.4;
  if ((m = etiqueta.match(/^(\d+)-(\d+)\/(\d+)"/))) return (Number(m[1]) + Number(m[2]) / Number(m[3])) * 25.4;
  if ((m = etiqueta.match(/^(\d+)\/(\d+)"/))) return (Number(m[1]) / Number(m[2])) * 25.4;
  if ((m = etiqueta.match(/^M(\d+) × (\d+(?:,\d+)?)/))) return Number(m[1]) + Number(m[2].replace(",", ".")) / 100; // machos M10 × 1,25
  if ((m = etiqueta.match(/^T(\d+)/))) return 1000 + Number(m[1]);
  if ((m = etiqueta.match(/^E(\d+)/))) return 2000 + Number(m[1]);
  return 9999;
}

/** Encastre + medida de un dado: lo que sigue al encastre ("1/2X17MM" → 1/2 y "17 mm"). */
function medidaDeDado(nombre: string): { encastre: string | null; medida: string | null } {
  const m = nombre.match(ENCASTRE);
  if (!m || m.index === undefined) return { encastre: null, medida: null };
  const resto = nombre.slice(m.index + m[0].length).replace(/^["\s]*[X-]?\s*/i, "");
  return { encastre: m[1], medida: leerMedida(resto) };
}

export type Clasificado = { grupo: string; etiqueta: string; encastre: string | null; seccion?: string; detalle?: string };

/** ¿A qué grupo va este producto y con qué medida? null: queda suelto. */
export function clasificar(nombre: string, marca: string | null = null): Clasificado | null {
  const n = nombre.toUpperCase().replace(/\s+/g, " ").trim();
  // Genéricos (mechas, rolineras, retenes, limas…): undefined = no es de esas familias.
  const generico = clasificarGenerico(n, marca, leerMedida);
  if (generico !== undefined) return generico;

  // Llaves combinadas Acesa (solo Acesa, a pedido de persona B).
  let m = n.match(/^ACESA LLAVE COMBINADA PROFESIONAL (.+)$/);
  if (m) {
    const etiqueta = leerMedida(m[1]);
    return etiqueta ? { grupo: "llave-combinada-acesa", etiqueta, encastre: null } : null;
  }

  // Dados magnéticos Ferrezaga: todos de 45 mm; la medida es la fracción del final.
  m = n.match(/^DADO MAGNETICO 45\s*MM X (\d+\/\d+)/);
  if (m) return { grupo: "dado-magnetico-ferrezaga", etiqueta: `${m[1]}"`, encastre: null };

  let grupo: string | null = null;
  if (/^ACESA DADO /.test(n)) grupo = "dado-acesa";
  else if (/^DADO ECONOMICO\/CHINO LARGO /.test(n)) grupo = "dado-economico-largo";
  else if (/^DADO ECONOMICO\/CHINO /.test(n)) grupo = "dado-economico";
  else if (/^PROTO DADOS? /.test(n)) grupo = /LARG/.test(n) ? "dado-largo-proto" : "dado-proto";
  else if (/^STANLEY\/PROMAKER DADO /.test(n)) grupo = "dado-hexagonal-corto-promaker";
  else if (/^STANLEY DADOS? /.test(n)) {
    const { encastre } = medidaDeDado(n);
    if (/TORX/.test(n)) grupo = "dado-torx-stanley";
    else if (/BUJIA/.test(n)) grupo = null; // uno solo: queda suelto
    // "P/HEXAG." = dado de punta hexagonal (Allen): va con los de punta.
    else if (/PUNTA|P\/HEXAG/.test(n)) grupo = "dado-punta-stanley";
    else if (/ESTRIA/.test(n) && /LARG/.test(n)) grupo = "dado-estria-largo-stanley";
    else if (encastre === "3/4") grupo = "dado-encastre-3-4-stanley";
    else if (/ESTRIA/.test(n)) grupo = "dado-estria-corto-stanley";
    else if (/LARG/.test(n)) grupo = "dado-hexagonal-largo-stanley";
    else if (/HEX|STANDARD/.test(n)) grupo = "dado-hexagonal-corto-stanley";
  }
  if (!grupo) return null;

  const { encastre, medida } = medidaDeDado(n);
  if (!medida) return null;
  const etiqueta = grupo === "dado-torx-stanley" && /HEMBRA/.test(n) ? `${medida} hembra` : medida;
  return { grupo, etiqueta, encastre };
}

const tituloSeccion = (seccion: Seccion | null, c: Clasificado): string | null => {
  if (seccion === "propia") return c.seccion ?? null;
  if (seccion === "encastre") return c.encastre ? `Encastre ${c.encastre}"` : null;
  if (seccion === "sistema") return c.etiqueta.endsWith(" mm") ? "Milímetros" : "Pulgadas";
  return null;
};
const ordenSeccion = (seccion: string | null) => {
  if (!seccion) return 0;
  if (seccion === "Milímetros") return 0;
  if (seccion === "Pulgadas") return 1;
  const i = ORDEN_ENCASTRE.findIndex((e) => seccion === `Encastre ${e}"`);
  if (i !== -1) return i;
  const j = ORDEN_SECCIONES.indexOf(seccion);
  if (j !== -1) return 10 + j;
  // 'Diámetro 1/4"', "Serie 471"…: por la medida o el número del final.
  const fin = seccion.split(" ").at(-1) ?? "";
  return 100 + (fin.includes("/") ? valorMedida(fin.endsWith('"') ? fin : `${fin}"`) : Number(fin) || 0);
};

/**
 * Agrupa una lista de productos de Saint. Devuelve:
 * - `productos`: la MISMA lista, pero cada producto de un grupo con nombre claro (`titulo`) y la foto del grupo, y los
 *   de FOTOS_SAINT con su foto (para el buscador, el carrito, favoritos y la cuenta).
 * - `listado`: para la lista de la categoría: cada grupo es una sola tarjeta, en el lugar de su primer producto.
 * - `grupos`: por id de grupo; `grupoDe`: de cada código, su grupo.
 */
export function agrupar(lista: Producto[]): {
  productos: Producto[];
  listado: Producto[];
  grupos: Map<string, Grupo>;
  grupoDe: Map<string, string>;
} {
  const clasificados = new Map<string, Clasificado>();
  const miembros = new Map<string, Producto[]>();
  for (const p of lista) {
    const c = clasificar(p.nombre, p.marca);
    if (!c) continue;
    clasificados.set(p.id, c);
    miembros.set(c.grupo, [...(miembros.get(c.grupo) ?? []), p]);
  }

  const grupos = new Map<string, Grupo>();
  const grupoDe = new Map<string, string>();
  const reemplazos = new Map<string, Producto>();
  for (const [clave, productos] of miembros) {
    if (productos.length < 2) continue;
    const def = GRUPOS[clave];
    const id = PREFIJO_GRUPO + clave;
    const variantes: Variante[] = productos
      .map((p) => {
        const c = clasificados.get(p.id)!;
        const seccion = tituloSeccion(def.seccion, c);
        // En el nombre de la medida va también el encastre del dado: 'Dado … 1/2" × 17 mm'.
        const detalle = c.detalle
          ? c.detalle
          : c.encastre && def.seccion === "encastre"
            ? `${c.encastre}" × ${c.etiqueta}`
            : def.seccionEnTitulo && seccion
              ? `${c.etiqueta} ${seccion.toLowerCase()}`
              : c.etiqueta;
        const producto: Producto = { ...p, titulo: `${def.titulo} ${detalle}`, imagen: def.imagen ?? p.imagen };
        reemplazos.set(p.id, producto);
        grupoDe.set(p.id, id);
        return { id: p.id, etiqueta: c.etiqueta, seccion, producto };
      })
      .sort(
        (a, b) =>
          ordenSeccion(a.seccion) - ordenSeccion(b.seccion) ||
          valorMedida(a.etiqueta) - valorMedida(b.etiqueta) ||
          a.etiqueta.localeCompare(b.etiqueta, "es", { numeric: true }),
      );
    // Dos medidas con el mismo nombre (pasa en Saint): se distinguen por su código.
    const repetidas = new Set<string>();
    const vistas = new Set<string>();
    for (const v of variantes) {
      const k = `${v.seccion}|${v.etiqueta}`;
      if (vistas.has(k)) repetidas.add(k);
      vistas.add(k);
    }
    for (const v of variantes) if (repetidas.has(`${v.seccion}|${v.etiqueta}`)) v.etiqueta = `${v.etiqueta} (${v.id})`;

    const marcas = new Set(productos.map((p) => p.marca));
    const primero = productos[0];
    const tarjeta: Producto = {
      id,
      nombre: def.titulo,
      titulo: def.titulo,
      marca: !def.sinMarca && marcas.size === 1 ? primero.marca : null,
      precio: Math.min(...productos.map((p) => p.precio)),
      ...(primero.tasa !== undefined ? { tasa: primero.tasa } : {}),
      imagen: def.imagen,
      categoriaSlug: primero.categoriaSlug,
      subcategoria: primero.subcategoria,
      variantes: variantes.length,
    };
    grupos.set(id, { id, titulo: def.titulo, tarjeta, variantes });
  }

  const productos = lista.map((p) => {
    const reemplazo = reemplazos.get(p.id);
    if (reemplazo) return reemplazo;
    const foto = FOTOS_SAINT[p.id] ?? fotoPorNombre(p.nombre, p.marca);
    return foto && !p.imagen ? { ...p, imagen: foto } : p;
  });

  const listado: Producto[] = [];
  const puestos = new Set<string>();
  for (const p of productos) {
    const g = grupoDe.get(p.id);
    if (!g) listado.push(p);
    else if (!puestos.has(g)) {
      puestos.add(g);
      listado.push(grupos.get(g)!.tarjeta);
    }
  }
  return { productos, listado, grupos, grupoDe };
}
