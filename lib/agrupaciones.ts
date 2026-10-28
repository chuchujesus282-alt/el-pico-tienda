import type { Producto } from "@/types/catalogo";
import { clasificarGenerico, GRUPOS_GENERICOS, ORDEN_SECCIONES } from "@/lib/agrupacionesGenericas";
import { nombreLegible } from "@/lib/nombresSaint";

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
};

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
  // Las demás unidades (lb, oz, t, HP…): por su número.
  if ((m = etiqueta.match(/^(\d+)\/(\d+)/))) return Number(m[1]) / Number(m[2]);
  if ((m = etiqueta.match(/^(\d+(?:[.,]\d+)?)/))) return Number(m[1].replace(",", "."));
  return 9999;
}

// ---------- grupos automáticos: misma marca y mismo nombre, cambia solo la medida ----------

/** Unidades que se leen como medida (y cómo se escriben). Sin "M" sola ni "A" sola: chocan con "3M" o "TIPO A". */
const UNIDADES: [RegExp, string][] = [
  [/^MM$/, "mm"],
  [/^CM$/, "cm"],
  [/^(MTS?|METROS?)$/, "m"],
  [/^(LBS?|LIBRAS?)$/, "lb"],
  [/^OZ$/, "oz"],
  [/^(KGS?|KILOS?)$/, "kg"],
  [/^GRS?$/, "g"],
  [/^TONS?$/, "t"],
  [/^HP$/, "HP"],
  [/^W$/, "W"],
  [/^V$/, "V"],
  [/^AMP$/, "A"],
  [/^PSI$/, "psi"],
  [/^(GAL|GALONES)$/, "gal"],
  [/^(LTS?|LITROS?)$/, "L"],
  [/^CC$/, "cc"],
  [/^KVA$/, "kVA"],
  [/^AH$/, "Ah"],
];
const UNIDAD = "MM|CM|MTS?|METROS?|LBS?|LIBRAS?|OZ|KGS?|KILOS?|GRS?|TONS?|HP|W|V|AMP|PSI|GALONES|GAL|LTS?|LITROS?|CC|KVA|AH";
/**
 * Una medida dentro del nombre: fracción ("1/2", "1-1/4", "2 1/2"") con o sin unidad, o número con unidad o comillas
 * ("10"", "16OZ", "12 TON", "3,3MM"). No cuenta lo pegado a otra cosa ("T200-7", "110/220V", "GWS850").
 */
const MEDIDA_EN_NOMBRE = new RegExp(
  `(?<![\\w/.,-])(?:(\\d+(?:[ .-]\\d+)?\\/\\d+)(?:"|''|\\s?(${UNIDAD})\\b)?|(\\d+(?:[.,]\\d+)?)\\s?(?:("|'')|(${UNIDAD})\\b))(?![\\w/])`,
  "g",
);

/** '1/2' → '1/2"'; "16","OZ" → "16 oz"; "3,3","MM" → "3,3 mm". null si no es una medida creíble ("60/40"). */
function etiquetaDeMedida(fraccion?: string, unidadFraccion?: string, numero?: string, comillas?: string, unidad?: string) {
  const legible = (u: string) => UNIDADES.find(([r]) => r.test(u))?.[1] ?? u.toLowerCase();
  if (fraccion) {
    const [arriba, abajo] = fraccion.split(/[ .-]/).at(-1)!.split("/").map(Number);
    // Solo fracciones de pulgada (…/2, /4, /8, /16, /32, /64): "60/40" o "220/440" no son medidas.
    if (!(arriba < abajo) || ![2, 4, 8, 16, 32, 64].includes(abajo)) return null;
    if (unidadFraccion) return `${fraccion.replace(/[ .]/, "-")} ${legible(unidadFraccion)}`;
    return leerMedida(fraccion);
  }
  if (!numero) return null;
  if (comillas) return `${numero.replace(".", ",")}"`;
  return `${numero} ${legible(unidad!)}`;
}

/**
 * Grupo automático de un producto: el nombre sin sus medidas (con la marca) es la clave, y las medidas son el botón.
 * "MANDARRIA MANGO FIBRA ECONOMICA 10LBS" → clave "MANDARRIA MANGO FIBRA ECONOMICA", etiqueta "10 lb". null: el nombre
 * no trae medida, o sin ella no queda un nombre que se entienda.
 */
export function claveAutomatica(nombre: string, marca: string | null): { clave: string; base: string; etiqueta: string } | null {
  const n = nombre
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/(?<=\d)"(?=[A-Z])/g, `" `) // 3/32"CADA → 3/32" CADA
    .replace(/\b1\/2 CANA\b/, "MEDIA CAÑA") // la lima de media caña no mide 1/2"
    .trim();
  const etiquetas: string[] = [];
  let base = n.replace(MEDIDA_EN_NOMBRE, (todo, fraccion, unidadFraccion, numero, comillas, unidad) => {
    const etiqueta = etiquetaDeMedida(fraccion, unidadFraccion, numero, comillas, unidad);
    if (!etiqueta) return todo;
    etiquetas.push(etiqueta);
    return " ";
  });
  if (!etiquetas.length) return null;
  base = base
    .replace(/\s+(X|\/\/|\/|-)(?=\s|$)/g, " ") // "12" X 304MM" → sin la "X" que unía las medidas
    .replace(/\(\s*\)/g, " ") // "(16CM)" → "( )"
    .replace(/(^|\s)("|[FMH])(?=\s|$)/g, " ") // restos: comillas sueltas, la F/M (hembra/macho) del adaptador
    .replace(/\s+/g, " ")
    .trim();
  // Lo que queda colgando al final: "ESPIGA DE", "PALETA O", "ROLLO DE .".
  for (let antes = ""; antes !== base; ) {
    antes = base;
    base = base.replace(/\s*(\bDE|\bD\/|\bP\/|\bPARA|\bX|\bO|\bY|\/\/|-|\.|,)$/, "").trim();
  }
  if (!/[A-ZÑ]{3}/.test(base)) return null;
  // Por marca. Si el nombre ya empieza con ella (o Saint no trae marca), cuenta el nombre: "BRUFER LLAVE…" con y sin
  // marca en Saint es el mismo producto.
  const primera = marca?.toUpperCase().split(/[\s/]+/)[0];
  const porNombre = !marca || (!!primera && base.split(/[\s/]+/)[0] === primera);
  return { clave: `${porNombre ? "" : marca}|${base}`, base, etiqueta: etiquetas.join(" × ") };
}

/** "MARCA|NIKATO LLAVE DE TUBO" → "nikato-llave-de-tubo" (para el id del grupo). */
const slugDe = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, "-")
    .replace(/^-|-$/g, "");

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
  const sinRegla: Producto[] = [];
  for (const p of lista) {
    const c = clasificar(p.nombre, p.marca);
    if (!c) {
      sinRegla.push(p);
      continue;
    }
    clasificados.set(p.id, c);
    miembros.set(c.grupo, [...(miembros.get(c.grupo) ?? []), p]);
  }

  // Lo que ninguna regla agrupa: misma marca y mismo nombre, cambiando solo la medida (lb, oz, pulgadas, t, HP…).
  const automaticos = new Map<string, DefGrupo>();
  for (const p of sinRegla) {
    const a = claveAutomatica(p.nombre, p.marca);
    if (!a) continue;
    const clave = `auto-${slugDe(a.clave)}`;
    if (!automaticos.has(clave)) {
      const titulo = nombreLegible(a.base, p.marca);
      automaticos.set(clave, { titulo, imagen: null, seccion: null, sinMarca: !p.marca });
    }
    clasificados.set(p.id, { grupo: clave, etiqueta: a.etiqueta, encastre: null });
    miembros.set(clave, [...(miembros.get(clave) ?? []), p]);
  }
  // En un grupo automático que mezcla milímetros y pulgadas, las medidas se separan en dos filas.
  for (const [clave, def] of automaticos) {
    const etiquetas = (miembros.get(clave) ?? []).map((p) => clasificados.get(p.id)!.etiqueta);
    if (etiquetas.some((e) => / mm$/.test(e)) && etiquetas.some((e) => /"$/.test(e))) def.seccion = "sistema";
  }

  const grupos = new Map<string, Grupo>();
  const grupoDe = new Map<string, string>();
  const reemplazos = new Map<string, Producto>();
  for (const [clave, productos] of miembros) {
    if (productos.length < 2) continue;
    const def = GRUPOS[clave] ?? automaticos.get(clave)!;
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
    const foto = FOTOS_SAINT[p.id];
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
