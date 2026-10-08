import MiniSearch from "minisearch";
import type { SearchOptions, SearchResult } from "minisearch";
import type { Producto } from "@/types/catalogo";
import { esMedida, palabrasClave, raiz, sinAcentos } from "./normalizar";
import { masVendidos, prepararCatalogo, ventas } from "./productos";
import type { ProductoIndexado } from "./tipos";

// Búsqueda inteligente. Librería: MiniSearch (índice invertido por palabra, ~7 KB): tolera errores de tipeo
// (fuzzy), no le importa el orden de las palabras y acepta nuestra normalización tal cual.
// Funciona igual en el servidor (página /buscar) y en el navegador (sugerencias mientras se escribe).

type Documento = { id: string; nombre: string; tipo: string; marca: string; categoria: string };

export type IndiceBusqueda = {
  motor: MiniSearch<Documento>;
  porId: Map<string, ProductoIndexado>;
  productos: Producto[];
  /** Palabras clave del catálogo → cuántos productos la usan y cómo mostrarla ("tornill" → "tornillo"). */
  vocabulario: Map<string, { veces: number; mostrar: string }>;
};

export type ResultadoBusqueda = {
  /** "completo": coincide todo lo escrito; "parcial": solo parte; "ninguno": no hubo coincidencias. */
  tipo: "completo" | "parcial" | "ninguno";
  productos: Producto[];
  /** "¿Quisiste decir…?" (null si lo escrito ya está bien). */
  sugerencia: string | null;
  /** Sin resultados: categoría más parecida a lo buscado (slug) y productos para no dejar la página vacía. */
  categoriaCercana: string | null;
  alternativos: Producto[];
};

const separar = (texto: string) => texto.split(" ").filter(Boolean);
const igual = (termino: string) => termino;

// Pesos de cada campo: el tipo de producto ("tornillo") pesa más que una palabra cualquiera del nombre.
const PESOS = { tipo: 2, nombre: 1, marca: 0.8, categoria: 0.4 };

const cache = new WeakMap<Producto[], IndiceBusqueda>();

/** Arma el índice de búsqueda (una vez por lista de productos). */
export function crearIndice(productos: Producto[]): IndiceBusqueda {
  const guardado = cache.get(productos);
  if (guardado) return guardado;

  const { lista, porId } = prepararCatalogo(productos);
  const motor = new MiniSearch<Documento>({
    fields: ["nombre", "tipo", "marca", "categoria"],
    tokenize: separar,
    processTerm: igual,
    searchOptions: { tokenize: separar, processTerm: igual },
  });
  motor.addAll(
    lista.map(({ producto, tokens, tipo }) => ({
      id: producto.id,
      nombre: tokens.join(" "),
      tipo,
      marca: producto.marca ? palabrasClave(producto.marca).join(" ") : "",
      categoria: palabrasClave(`${producto.subcategoria ?? ""} ${producto.categoriaSlug.replace(/-/g, " ")}`).join(" "),
    })),
  );

  const vocabulario: IndiceBusqueda["vocabulario"] = new Map();
  for (const { producto, tokens } of lista) {
    // Palabra original del nombre para cada raíz ("tornill" ← "tornillos"), para mostrarla bien escrita.
    const originales = new Map<string, string>();
    for (const o of sinAcentos(producto.nombre).split(/[^a-z]+/)) if (o && !originales.has(raiz(o))) originales.set(raiz(o), o);
    for (const token of new Set(tokens)) {
      if (esMedida(token)) continue;
      const entrada = vocabulario.get(token) ?? { veces: 0, mostrar: token };
      entrada.veces += 1;
      const original = originales.get(token);
      if (original && (entrada.mostrar === token || original.length < entrada.mostrar.length)) entrada.mostrar = original;
      vocabulario.set(token, entrada);
    }
  }

  const indice = { motor, porId, productos, vocabulario };
  cache.set(productos, indice);
  return indice;
}

/** Opciones de MiniSearch: errores de tipeo en palabras de 4+ letras; la última palabra puede estar a medio escribir. */
function opciones(combinar: "AND" | "OR", tolerancia = 0.2): SearchOptions {
  return {
    combineWith: combinar,
    boost: PESOS,
    // Las medidas nunca se corrigen ni se completan: 1/4 no es 1/2.
    fuzzy: (t) => (esMedida(t) || t.length < 4 ? false : tolerancia),
    prefix: (t, i, todos) => i === todos.length - 1 && !esMedida(t) && t.length >= 2,
  };
}

/**
 * Nivel de la coincidencia (menor = mejor):
 * 0 exacta (todas las palabras tal cual) · 1 tipo y medida · 2 completa con errores de tipeo · 3 parcial.
 */
function nivel(p: ProductoIndexado, palabras: string[], r: SearchResult, completa: boolean): number {
  if (!completa) return 3;
  if (palabras.every((t) => p.todas.has(t))) return 0;
  const medidas = palabras.filter(esMedida);
  if (r.terms.includes(p.tipo) && medidas.length > 0 && medidas.every((m) => p.medidas.includes(m))) return 1;
  return 2;
}

function ordenar(indice: IndiceBusqueda, palabras: string[], resultados: SearchResult[], completa: boolean): Producto[] {
  return resultados
    .map((r) => {
      const p = indice.porId.get(String(r.id))!;
      // El puntaje se agrupa en escalones (~20 %): dentro del mismo escalón gana el más vendido.
      return { p, nivel: nivel(p, palabras, r, completa), escalon: Math.round(Math.log2(r.score) * 4) };
    })
    .sort(
      (a, b) => a.nivel - b.nivel || b.escalon - a.escalon || ventas(b.p.producto) - ventas(a.p.producto),
    )
    .map((x) => x.p.producto);
}

function distancia(a: string, b: string, maxima: number): number {
  if (Math.abs(a.length - b.length) > maxima) return maxima + 1;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimo = i;
    for (let j = 1; j <= b.length; j++) {
      actual[j] = Math.min(previa[j] + 1, actual[j - 1] + 1, previa[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      minimo = Math.min(minimo, actual[j]);
    }
    if (minimo > maxima) return maxima + 1;
    previa = actual;
  }
  return previa[b.length];
}

/** "¿Quisiste decir…?": corrige cada palabra que no existe en el catálogo por la más parecida que sí existe. */
export function quisoDecir(indice: IndiceBusqueda, consulta: string): string | null {
  const palabras = palabrasClave(consulta);
  let cambio = false;
  const corregidas = palabras.map((palabra) => {
    const conocida = indice.vocabulario.get(palabra);
    if (conocida || esMedida(palabra)) return conocida?.mostrar ?? palabra;
    const maxima = palabra.length >= 6 ? 2 : 1;
    let mejor: { mostrar: string; d: number; veces: number } | null = null;
    for (const [termino, { veces, mostrar }] of indice.vocabulario) {
      const d = distancia(palabra, termino, maxima);
      if (d <= maxima && (!mejor || d < mejor.d || (d === mejor.d && veces > mejor.veces))) mejor = { mostrar, d, veces };
    }
    if (!mejor) return palabra;
    cambio = true;
    return mejor.mostrar;
  });
  return cambio ? corregidas.join(" ") : null;
}

function buscarCrudo(indice: IndiceBusqueda, palabras: string[]) {
  const consulta = palabras.join(" ");
  const completos = indice.motor.search(consulta, opciones("AND"));
  if (completos.length) return { tipo: "completo" as const, productos: ordenar(indice, palabras, completos, true) };
  const parciales = indice.motor.search(consulta, opciones("OR"));
  if (parciales.length) return { tipo: "parcial" as const, productos: ordenar(indice, palabras, parciales, false) };
  return { tipo: "ninguno" as const, productos: [] };
}

/** Sugerencias en vivo mientras el cliente escribe (rápido: sin "¿Quisiste decir…?"). */
export function sugerir(indice: IndiceBusqueda, consulta: string, limite = 6): Producto[] {
  const palabras = palabrasClave(consulta);
  if (!palabras.length) return [];
  return buscarCrudo(indice, palabras).productos.slice(0, limite);
}

/**
 * Sugerencias en vivo que toleran errores de ortografía: si lo escrito no encuentra nada,
 * se corrige con "¿Quisiste decir…?" (ej. "martiyo" → "martillo") y se sugiere con la corrección.
 * `correccion` trae el texto corregido para avisarle al cliente; es null si no hizo falta.
 */
export function sugerirCorrigiendo(
  indice: IndiceBusqueda,
  consulta: string,
  limite = 6,
): { productos: Producto[]; correccion: string | null } {
  const directos = sugerir(indice, consulta, limite);
  if (directos.length) return { productos: directos, correccion: null };
  const correccion = quisoDecir(indice, consulta);
  if (!correccion) return { productos: [], correccion: null };
  const productos = sugerir(indice, correccion, limite);
  return productos.length ? { productos, correccion } : { productos: [], correccion: null };
}

/** Búsqueda completa (página de resultados). Nunca deja al cliente sin nada que ver. */
export function buscar(indice: IndiceBusqueda, consulta: string, limite = 60): ResultadoBusqueda {
  const palabras = palabrasClave(consulta);
  if (!palabras.length) {
    return { tipo: "ninguno", productos: [], sugerencia: null, categoriaCercana: null, alternativos: masVendidos(indice.productos, 8) };
  }

  const { tipo, productos } = buscarCrudo(indice, palabras);
  const sugerencia = tipo === "completo" ? null : quisoDecir(indice, consulta);
  if (tipo !== "ninguno") {
    return { tipo, productos: productos.slice(0, limite), sugerencia, categoriaCercana: null, alternativos: [] };
  }

  // Nada coincidió: se busca con la corrección y con más tolerancia para adivinar la categoría.
  const intento = indice.motor.search(palabrasClave(sugerencia ?? consulta).join(" "), opciones("OR", 0.4));
  const categoriaCercana = intento.length ? indice.porId.get(String(intento[0].id))!.producto.categoriaSlug : null;
  return {
    tipo,
    productos: [],
    sugerencia,
    categoriaCercana,
    alternativos: masVendidos(indice.productos, 8, { categoria: categoriaCercana ?? undefined }),
  };
}
