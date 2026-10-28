import "server-only";

import type { Producto } from "@/types/catalogo";
import { CATEGORIAS_SAINT, codigoSaint } from "@/lib/categoriasSaint";
import { nombreLegible } from "@/lib/nombresSaint";
import { agrupar, type Grupo } from "@/lib/agrupaciones";
import { repartirPorCategoria } from "@/lib/repartirSaint";

// Productos REALES de Saint, por categoría (las del mapa de lib/categoriasSaint.ts). Solo se usa desde lib/catalogo.ts
// y lib/tasa.ts. Responsable: persona A.
//
// PRODUCTOS_API_URL (en .env.local y en Vercel) ya trae la clave; se le suma &categoria=CODIGO (o varios separados por
// coma). Se pide SOLO desde el servidor de Next: la clave nunca llega al navegador. Responde comprimido con gzip (el
// fetch de Node lo descomprime solo):
//   { tasa, categoria, total, subcategorias: [{ codigo, nombre, codCategoria, cantidad }],
//     productos: [{ codigo, nombre, marca, codCategoria, codSubcategoria, subcategoria, precioBs, precioUsd }] }
// precioBs ya incluye IVA y precioUsd = precioBs / tasa. Cada producto y subcategoría se reparte a su categoría de la
// web por codCategoria (lib/repartirSaint.ts).
//
// Dos caminos (con las 10 categorías son 11.777 productos):
// - La PÁGINA de una categoría pide SOLO esa categoría (getCategoriaSaint): pesa de 30 a 650 KB, así que la guarda la
//   caché de Next 10 minutos, y si una categoría falla las demás siguen.
// - El ÍNDICE (buscador, "Te puede interesar", carrito, favoritos, página de producto) pide TODAS en un pedido
//   (getTodosSaint): pesa más de 2 MB (2,3 MB hoy), que la caché de Next NO guarda; la caché real es la memoria
//   (`todas`), que dura los mismos 10 minutos. Si falla y no hay nada guardado, se arma categoría por categoría.
// En los dos, la lista ya convertida (nombres legibles, claves de búsqueda) se reutiliza mientras la respuesta no
// cambie; así filtrar, ordenar y paginar en cada visita toma milisegundos, y la búsqueda y las recomendaciones
// (lib/indiceServidor.ts) reciben la MISMA lista y no se vuelven a preparar. Si Saint no responde, se sigue usando la
// última lista buena; si nunca hubo una, se lanza ErrorSaint (la página muestra "No pudimos cargar los productos").
//
// NUNCA se copian existencias ni cantidades de inventario: de cada producto solo se toman los campos de abajo.

const API_URL = process.env.PRODUCTOS_API_URL;
const REVALIDAR_SEGUNDOS = 600;
/** Cada cuánto se vuelve a mirar la caché de Next (barato: si la respuesta no cambió, se reutiliza la lista). */
const MEMORIA_MS = 60_000;
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
  /** Con su código de Saint, su nombre legible y la cantidad de productos que trae Saint (un grupo cuenta como uno). */
  subcategorias: { codigo: string; nombre: string; cantidad: number }[];
};

/**
 * La última respuesta buena de cada categoría (su propio pedido, para la página de la categoría) y la del pedido con
 * TODAS (para el índice de búsqueda, el carrito y los favoritos). Cada una se reutiliza mientras su texto no cambie.
 */
type Guardada = { datos: CategoriaSaint; texto: string; revisar: number };
const guardadas = new Map<number, Guardada>();
const pedidos = new Map<number, Promise<CategoriaSaint>>();
type GuardadaTodas = { porSlug: Map<string, CategoriaSaint>; texto: string; revisar: number };
let todas: GuardadaTodas | null = null;
let pedidoTodas: Promise<Map<string, CategoriaSaint>> | null = null;

/** "Llave ALLEN Combinada" → "llave allen combinada"; "Medición" → "medicion". */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const esTexto = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const numero = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN);
const redondear = (n: number) => Math.round(n * 100) / 100;

/** Respuesta de Saint → lista lista para la tienda. Lo que no tenga código, nombre o precio válido se deja fuera. */
function convertir(slug: string, crudo: unknown): CategoriaSaint {
  const datos = (crudo ?? {}) as { tasa?: unknown; subcategorias?: unknown; productos?: unknown };
  const tasa = numero(datos.tasa);
  if (!Array.isArray(datos.productos)) throw new ErrorSaint("Saint respondió sin lista de productos");

  const subcategorias: CategoriaSaint["subcategorias"] = [];
  const nombrePorCodigo = new Map<string, string>();
  for (const sub of Array.isArray(datos.subcategorias) ? datos.subcategorias : []) {
    const { codigo, nombre, cantidad } = (sub ?? {}) as Record<string, unknown>;
    if (!esTexto(nombre)) continue;
    const legible = nombreLegible(nombre);
    nombrePorCodigo.set(String(codigo), legible);
    subcategorias.push({ codigo: String(codigo), nombre: legible, cantidad: Math.max(0, Math.trunc(numero(cantidad)) || 0) });
  }

  const crudos: Producto[] = [];
  const vistos = new Set<string>();
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
    const producto: Producto = {
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
    };
    crudos.push(producto);
  }

  // Medidas del mismo producto (llaves combinadas Acesa, dados…): un grupo con su foto (lib/agrupaciones.ts, persona B).
  const { productos, listado, grupos, grupoDe } = agrupar(crudos);
  const clave = (p: Producto) => normalizar(`${p.id} ${p.nombre} ${p.titulo ?? ""} ${p.marca ?? ""}`);
  const claves = productos.map(clave);
  const clavesListado = listado.map((p) =>
    grupos.has(p.id) ? [clave(p), ...grupos.get(p.id)!.variantes.map((v) => clave(v.producto))].join(" ") : clave(p),
  );
  // En el filtro, cada grupo cuenta como un producto (como se ve en la lista).
  for (const g of grupos.values()) {
    const sub = subcategorias.find((s) => s.nombre === g.tarjeta.subcategoria);
    if (sub) sub.cantidad = Math.max(1, sub.cantidad - (g.variantes.length - 1));
  }

  return {
    tasa: Number.isFinite(tasa) && tasa > 0 ? tasa : 0,
    productos,
    claves,
    listado,
    clavesListado,
    grupos,
    grupoDe,
    subcategorias,
  };
}

/**
 * Pide a Saint y devuelve el texto. El mensaje de error nunca lleva la URL: tiene la clave.
 * `cacheNext: false` para el pedido con TODAS las categorías: pesa más de 2 MB, la caché de Next no lo guarda (lo
 * guarda la memoria) y, si se le pide, Next escribe un aviso en los registros CON LA URL (y la clave).
 */
async function pedirTexto(codigos: number[], etiqueta: string, cacheNext = true): Promise<string> {
  if (!API_URL) throw new ErrorSaint("Falta PRODUCTOS_API_URL");
  const url = new URL(API_URL);
  url.searchParams.set("categoria", codigos.join(","));
  try {
    const respuesta = await fetch(url, {
      ...(cacheNext ? { next: { revalidate: REVALIDAR_SEGUNDOS, tags: ["saint", etiqueta] } } : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
    });
    if (!respuesta.ok) throw new ErrorSaint(`Saint respondió ${respuesta.status} (${etiqueta})`);
    return await respuesta.text();
  } catch (error) {
    if (error instanceof ErrorSaint) throw error;
    throw new ErrorSaint(`No se pudo conectar con Saint (${etiqueta})`);
  }
}

function leerJson(texto: string, etiqueta: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    throw new ErrorSaint(`Saint respondió algo que no es JSON (${etiqueta})`);
  }
}

/** Una sola categoría: su respuesta pesa menos de 2 MB, así que la guarda la caché de Next (10 minutos). */
async function pedirCategoria(slug: string, codigo: number): Promise<CategoriaSaint> {
  const texto = await pedirTexto([codigo], `saint-${codigo}`);
  const anterior = guardadas.get(codigo);
  // La misma respuesta de antes (caché de Next): se reutiliza la lista ya convertida.
  if (anterior && anterior.texto === texto) {
    anterior.revisar = Date.now() + MEMORIA_MS;
    return anterior.datos;
  }
  const partes = repartirPorCategoria(leerJson(texto, `categoría ${codigo}`), { [slug]: codigo });
  const datos = convertir(slug, partes.get(slug));
  guardadas.set(codigo, { datos, texto, revisar: Date.now() + MEMORIA_MS });
  return datos;
}

/**
 * Productos de Saint de UNA categoría de la web (para su página): pide solo esa categoría, así cada página carga lo
 * suyo y, si una categoría falla, las demás siguen. Lanza ErrorSaint si no hay datos (ni nuevos ni guardados).
 */
export async function getCategoriaSaint(slug: string): Promise<CategoriaSaint> {
  const codigo = codigoSaint(slug);
  if (codigo === undefined) throw new ErrorSaint(`La categoría "${slug}" no tiene código de Saint`);

  const guardada = guardadas.get(codigo);
  if (guardada && guardada.revisar > Date.now()) return guardada.datos;

  // Varias visitas a la vez comparten un solo pedido.
  let pedido = pedidos.get(codigo);
  if (!pedido) {
    pedido = pedirCategoria(slug, codigo)
      .catch((error: unknown) => {
        const ultima = guardadas.get(codigo);
        if (!ultima) throw error;
        console.error(`[saint] ${error instanceof Error ? error.message : error}; se usa la última lista buena.`);
        ultima.revisar = Date.now() + MEMORIA_MS; // no reintentar en cada visita mientras Saint está caído
        return ultima.datos;
      })
      .finally(() => pedidos.delete(codigo));
    pedidos.set(codigo, pedido);
  }
  return pedido;
}

/** ¿La categoría muestra productos de Saint? */
export const esCategoriaSaint = (slug: string) => codigoSaint(slug) !== undefined;

/**
 * UN pedido con todas las categorías del mapa (&categoria=1171,1498,…), repartido por codCategoria. Pesa más de 2 MB:
 * la caché de Next no lo guarda, así que la memoria dura los 10 minutos completos.
 */
async function pedirTodas(): Promise<Map<string, CategoriaSaint>> {
  const texto = await pedirTexto(Object.values(CATEGORIAS_SAINT), "saint-todas", false);
  // Sin caché de Next, cada pedido va a Saint: la memoria dura los 10 minutos completos.
  const vigencia = REVALIDAR_SEGUNDOS * 1000;
  // La misma respuesta de antes: las MISMAS listas, así el índice de búsqueda no se vuelve a armar.
  if (todas && todas.texto === texto) {
    todas.revisar = Date.now() + vigencia;
    return todas.porSlug;
  }
  const porSlug = new Map<string, CategoriaSaint>();
  for (const [slug, parte] of repartirPorCategoria(leerJson(texto, "todas"), CATEGORIAS_SAINT)) {
    porSlug.set(slug, convertir(slug, parte));
  }
  todas = { porSlug, texto, revisar: Date.now() + vigencia };
  return porSlug;
}

/** Todas las categorías juntas, o la última lista buena. Lanza ErrorSaint si no hay ninguna de las dos. */
function getTodasJuntas(): Promise<Map<string, CategoriaSaint>> {
  if (todas && todas.revisar > Date.now()) return Promise.resolve(todas.porSlug);
  pedidoTodas ??= pedirTodas()
    .catch((error: unknown) => {
      if (!todas) throw error;
      console.error(`[saint] ${error instanceof Error ? error.message : error}; se usa la última lista buena.`);
      todas.revisar = Date.now() + MEMORIA_MS; // no reintentar en cada visita mientras Saint está caído
      return todas.porSlug;
    })
    .finally(() => {
      pedidoTodas = null;
    });
  return pedidoTodas;
}

/**
 * Todos los productos de Saint (todas las categorías del mapa), para el índice de búsqueda, el carrito y los favoritos.
 * Primero, UN pedido con todas (o su última lista buena). Si eso falla y no hay nada guardado, se arma con los pedidos
 * de cada categoría que sí respondan. `completo: false` si alguna categoría falta (sus productos no es que no existan).
 */
export async function getTodosSaint(): Promise<{ listas: CategoriaSaint[]; completo: boolean }> {
  const slugs = Object.keys(CATEGORIAS_SAINT);
  try {
    const porSlug = await getTodasJuntas();
    return { listas: [...porSlug.values()], completo: porSlug.size === slugs.length };
  } catch (error) {
    console.error("[saint]", error instanceof Error ? error.message : error, "; se prueba categoría por categoría.");
    const resultados = await Promise.allSettled(slugs.map((slug) => getCategoriaSaint(slug)));
    const listas = resultados.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    return { listas, completo: listas.length === slugs.length };
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
