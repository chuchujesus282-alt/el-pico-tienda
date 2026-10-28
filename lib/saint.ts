import "server-only";

import type { Producto } from "@/types/catalogo";
import { CATEGORIAS_SAINT, codigoSaint } from "@/lib/categoriasSaint";
import { nombreLegible } from "@/lib/nombresSaint";
import { agrupar, type Grupo } from "@/lib/agrupaciones";
import { repartirPorCategoria } from "@/lib/repartirSaint";
import { ORDEN_SUBCATEGORIAS, reclasificar } from "@/lib/clasificacionSaint";

// Productos REALES de Saint, por categoría (las del mapa de lib/categoriasSaint.ts). Solo se usa desde lib/catalogo.ts
// y lib/tasa.ts. Responsable: persona A.
//
// PRODUCTOS_API_URL (en .env.local y en Vercel) ya trae la clave; se le suma &categoria=1171,1200,… (TODAS las
// categorías del mapa en UN solo pedido). Se pide SOLO desde el servidor de Next: la clave nunca llega al navegador.
// Responde comprimido con gzip (el fetch de Node lo descomprime solo):
//   { tasa, categoria, total, subcategorias: [{ codigo, nombre, codCategoria, cantidad }],
//     productos: [{ codigo, nombre, marca, codCategoria, codSubcategoria, subcategoria, precioBs, precioUsd }] }
// precioBs ya incluye IVA y precioUsd = precioBs / tasa. Cada producto y subcategoría se reparte a su categoría de la
// web por codCategoria (con una sola categoría en el mapa, todo va a esa aunque falte codCategoria).
//
// Rendimiento: la respuesta (≈650 KB con 3.176 herramientas) se guarda en la caché de Next 10 minutos. Ojo: esa caché
// NO guarda respuestas de más de 2 MB (con ~30.000 productos serán 5–6 MB): entonces la caché real es la memoria
// (`guardada`), que en ese caso dura los mismos 10 minutos en vez de 1. Encima, la lista ya convertida (nombres
// legibles, claves de búsqueda) se reutiliza mientras la respuesta no cambie; así filtrar, ordenar y paginar en cada
// visita toma milisegundos, y la búsqueda y las recomendaciones (lib/indiceServidor.ts) reciben la MISMA lista y no se
// vuelven a preparar. Si Saint no responde, se sigue usando la última lista buena; si nunca hubo una, se lanza
// ErrorSaint (la página muestra "No pudimos cargar los productos").
//
// NUNCA se copian existencias ni cantidades de inventario: de cada producto solo se toman los campos de abajo.

const API_URL = process.env.PRODUCTOS_API_URL;
const REVALIDAR_SEGUNDOS = 600;
/** Cada cuánto se vuelve a mirar la caché de Next (barato: si la respuesta no cambió, se reutiliza la lista). */
const MEMORIA_MS = 60_000;
/** La caché de datos de Next no guarda respuestas más grandes que esto: ahí la memoria dura los 10 minutos completos. */
const TOPE_CACHE_NEXT = 2 * 1024 * 1024;
const ESPERA_MAXIMA_MS = 20_000;

export class ErrorSaint extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorSaint";
  }
}

export type CategoriaSaint = {
  tasa: number;
  /** Todos los productos (cada medida de un grupo por separado, con su nombre claro): buscador, carrito, favoritos. */
  productos: Producto[];
  /** Texto normalizado (sin acentos, minúsculas) de código + nombre + marca, en el mismo orden que productos. */
  claves: string[];
  /** Para la lista de la categoría: cada grupo de medidas es una sola tarjeta (lib/agrupaciones.ts). */
  listado: Producto[];
  /** Como `claves`, para `listado` (la tarjeta de un grupo junta las de todas sus medidas). */
  clavesListado: string[];
  /** Grupos de medidas por id, y de cada código su grupo. */
  grupos: Map<string, Grupo>;
  grupoDe: Map<string, string>;
  /** Las de la web (lib/clasificacionSaint.ts), con un código de texto y cuántos productos se ven (un grupo cuenta uno). */
  subcategorias: { codigo: string; nombre: string; cantidad: number }[];
};

/** La última respuesta buena de Saint, ya repartida por categoría de la web (slug → lista). */
type Guardada = { porSlug: Map<string, CategoriaSaint>; texto: string; revisar: number };
let guardada: Guardada | null = null;
let pedido: Promise<Map<string, CategoriaSaint>> | null = null;

/** "Llave ALLEN Combinada" → "llave allen combinada"; "Medición" → "medicion". */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const esTexto = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const numero = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN);
const redondear = (n: number) => Math.round(n * 100) / 100;

/** Parte de la respuesta de Saint → sus productos (con la categoría y subcategoría de Saint). Lo que no tenga código,
 * nombre o precio válido se deja fuera. */
function leer(slug: string, crudo: unknown, vistos: Set<string>): { tasa: number; productos: Producto[] } {
  const datos = (crudo ?? {}) as { tasa?: unknown; subcategorias?: unknown; productos?: unknown };
  const tasa = numero(datos.tasa);
  if (!Array.isArray(datos.productos)) throw new ErrorSaint("Saint respondió sin lista de productos");

  const nombrePorCodigo = new Map<string, string>();
  for (const sub of Array.isArray(datos.subcategorias) ? datos.subcategorias : []) {
    const { codigo, nombre } = (sub ?? {}) as Record<string, unknown>;
    if (esTexto(nombre)) nombrePorCodigo.set(String(codigo), nombreLegible(nombre));
  }

  const productos: Producto[] = [];
  for (const fila of datos.productos) {
    const { codigo, nombre, marca, codSubcategoria, subcategoria, precioBs, precioUsd } = (fila ?? {}) as Record<string, unknown>;
    if (!esTexto(codigo) || !esTexto(nombre)) continue;
    const id = codigo.trim();
    const precio = numero(precioUsd);
    if (vistos.has(id) || !Number.isFinite(precio) || precio <= 0) continue;
    vistos.add(id);

    const marcaReal = esTexto(marca) && marca.trim() !== "S/M" ? marca.trim() : null;
    const nombreLimpio = nombre.trim().replace(/\s+/g, " ");
    const bs = numero(precioBs);
    productos.push({
      id,
      nombre: nombreLimpio,
      titulo: nombreLegible(nombreLimpio, marcaReal),
      marca: marcaReal,
      precio: redondear(precio),
      ...(Number.isFinite(bs) && bs > 0 ? { precioBs: redondear(bs) } : {}),
      ...(Number.isFinite(tasa) && tasa > 0 ? { tasa } : {}),
      imagen: null, // todavía no hay fotos: la tarjeta muestra el ícono de la subcategoría
      categoriaSlug: slug,
      subcategoria:
        nombrePorCodigo.get(String(codSubcategoria)) ?? (esTexto(subcategoria) ? nombreLegible(subcategoria) : null),
    });
  }
  return { tasa: Number.isFinite(tasa) && tasa > 0 ? tasa : 0, productos };
}

/** "Accesorios para herramientas" → "accesorios-para-herramientas" (el código de una subcategoría de la web). */
const codigoDeSubcategoria = (nombre: string) => normalizar(nombre).replace(/[^a-z0-9ñ]+/g, "-").replace(/^-|-$/g, "");

/** Los productos (ya reclasificados) de una categoría de la web → la lista lista para la tienda. */
function armar(slug: string, tasa: number, crudos: Producto[]): CategoriaSaint {
  // Medidas del mismo producto (llaves combinadas Acesa, dados…): un grupo con su foto (lib/agrupaciones.ts, persona B).
  const { productos, listado, grupos, grupoDe } = agrupar(crudos);
  const clave = (p: Producto) => normalizar(`${p.id} ${p.nombre} ${p.titulo ?? ""} ${p.marca ?? ""}`);
  const claves = productos.map(clave);
  const clavesListado = listado.map((p) =>
    grupos.has(p.id) ? [clave(p), ...grupos.get(p.id)!.variantes.map((v) => clave(v.producto))].join(" ") : clave(p),
  );

  // Subcategorías: las que de verdad tienen productos, contadas como se ven en la lista (un grupo cuenta como uno), en
  // el orden de lib/clasificacionSaint.ts (las demás al final, por nombre).
  const cantidades = new Map<string, number>();
  for (const p of listado) if (p.subcategoria) cantidades.set(p.subcategoria, (cantidades.get(p.subcategoria) ?? 0) + 1);
  const orden = ORDEN_SUBCATEGORIAS[slug] ?? [];
  const posicion = (nombre: string) => (orden.includes(nombre) ? orden.indexOf(nombre) : orden.length);
  const subcategorias = [...cantidades]
    .sort(([a], [b]) => posicion(a) - posicion(b) || a.localeCompare(b, "es"))
    .map(([nombre, cantidad]) => ({ codigo: codigoDeSubcategoria(nombre), nombre, cantidad }));

  return { tasa, productos, claves, listado, clavesListado, grupos, grupoDe, subcategorias };
}
/** UN pedido con todas las categorías del mapa, repartido por categoría de la web. */
async function pedir(): Promise<Map<string, CategoriaSaint>> {
  if (!API_URL) throw new ErrorSaint("Falta PRODUCTOS_API_URL");
  const codigos = Object.values(CATEGORIAS_SAINT);
  const url = new URL(API_URL);
  url.searchParams.set("categoria", codigos.join(","));

  let texto: string;
  try {
    const respuesta = await fetch(url, {
      next: { revalidate: REVALIDAR_SEGUNDOS, tags: ["saint"] },
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
    });
    // El mensaje nunca lleva la URL: tiene la clave.
    if (!respuesta.ok) throw new ErrorSaint(`Saint respondió ${respuesta.status}`);
    texto = await respuesta.text();
  } catch (error) {
    if (error instanceof ErrorSaint) throw error;
    throw new ErrorSaint("No se pudo conectar con Saint");
  }

  // Respuesta grande: la caché de Next no la guarda, así que la memoria dura los 10 minutos completos.
  const vigencia = texto.length > TOPE_CACHE_NEXT ? REVALIDAR_SEGUNDOS * 1000 : MEMORIA_MS;
  // La misma respuesta de antes (caché de Next): se reutilizan las listas ya convertidas (las MISMAS, así el índice de
  // búsqueda no se vuelve a armar).
  if (guardada && guardada.texto === texto) {
    guardada.revisar = Date.now() + vigencia;
    return guardada.porSlug;
  }
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    throw new ErrorSaint("Saint respondió algo que no es JSON");
  }
  // Cada producto va a la categoría y subcategoría que le corresponde por su nombre (lib/clasificacionSaint.ts): en
  // Herramientas de Saint vienen bombas de agua, gatos de carro, desmalezadoras… Por eso puede haber listas de
  // categorías que no están en el mapa (Plomería, Vehículos…): ahí se muestran junto a sus productos de ejemplo.
  const vistos = new Set<string>();
  const porDestino = new Map<string, Producto[]>(Object.keys(CATEGORIAS_SAINT).map((slug) => [slug, []]));
  let tasa = 0;
  for (const [slug, parte] of repartirPorCategoria(crudo, CATEGORIAS_SAINT)) {
    const leida = leer(slug, parte, vistos);
    tasa ||= leida.tasa;
    for (const p of leida.productos) {
      const destino = reclasificar({ nombre: p.nombre, categoriaSlug: slug, subcategoria: p.subcategoria ?? null });
      p.categoriaSlug = destino.categoria;
      p.subcategoria = destino.subcategoria;
      if (!porDestino.has(destino.categoria)) porDestino.set(destino.categoria, []);
      porDestino.get(destino.categoria)!.push(p);
    }
  }
  const porSlug = new Map<string, CategoriaSaint>();
  for (const [slug, productos] of porDestino) porSlug.set(slug, armar(slug, tasa, productos));
  guardada = { porSlug, texto, revisar: Date.now() + vigencia };
  return porSlug;
}

/** Todas las categorías de Saint (slug → lista). Lanza ErrorSaint si no hay datos (ni nuevos ni guardados). */
async function getPorSlug(): Promise<Map<string, CategoriaSaint>> {
  if (guardada && guardada.revisar > Date.now()) return guardada.porSlug;

  // Varias visitas a la vez comparten un solo pedido.
  pedido ??= pedir()
    .catch((error: unknown) => {
      if (!guardada) throw error;
      console.error(`[saint] ${error instanceof Error ? error.message : error}; se usa la última lista buena.`);
      guardada.revisar = Date.now() + MEMORIA_MS; // no reintentar en cada visita mientras Saint está caído
      return guardada.porSlug;
    })
    .finally(() => {
      pedido = null;
    });
  return pedido;
}

/** Productos de Saint de una categoría de la web. Lanza ErrorSaint si no hay datos (ni nuevos ni guardados). */
export async function getCategoriaSaint(slug: string): Promise<CategoriaSaint> {
  if (codigoSaint(slug) === undefined) throw new ErrorSaint(`La categoría "${slug}" no tiene código de Saint`);
  const datos = (await getPorSlug()).get(slug);
  if (!datos) throw new ErrorSaint(`Saint no trajo la categoría "${slug}"`);
  return datos;
}

/** ¿La categoría muestra productos de Saint? */
export const esCategoriaSaint = (slug: string) => codigoSaint(slug) !== undefined;

/**
 * Productos de Saint que se reclasificaron a una categoría que NO es de Saint (bombas de agua → Plomería…). null si no
 * hay o si Saint no responde: esas categorías siguen mostrando sus productos de ejemplo. Nunca lanza.
 */
export async function getMovidosSaint(slug: string): Promise<CategoriaSaint | null> {
  if (esCategoriaSaint(slug) || !Object.keys(CATEGORIAS_SAINT).length) return null;
  try {
    return (await getPorSlug()).get(slug) ?? null;
  } catch {
    return null;
  }
}

/**
 * Todos los productos de Saint (todas las categorías del mapa, en un solo pedido), para el índice de búsqueda, el
 * carrito y los favoritos. `completo: false` si Saint no respondió y no hay una lista guardada (faltan sus productos).
 */
export async function getTodosSaint(): Promise<{ listas: CategoriaSaint[]; completo: boolean }> {
  if (!Object.keys(CATEGORIAS_SAINT).length) return { listas: [], completo: true };
  try {
    const porSlug = await getPorSlug();
    return { listas: [...porSlug.values()], completo: Object.keys(CATEGORIAS_SAINT).every((slug) => porSlug.has(slug)) };
  } catch (error) {
    console.error("[saint]", error instanceof Error ? error.message : error);
    return { listas: [], completo: false };
  }
}

/** Tasa BCV con la que Saint calculó los precios (respaldo de lib/tasa.ts). null si no hay. Nunca lanza. */
export async function getTasaSaint(): Promise<number | null> {
  const [slug] = Object.keys(CATEGORIAS_SAINT);
  if (!slug || !API_URL) return null;
  try {
    const { tasa } = await getCategoriaSaint(slug);
    return tasa > 0 ? tasa : null;
  } catch {
    return null;
  }
}
