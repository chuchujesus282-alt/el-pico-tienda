import "server-only";

import type { Producto } from "@/types/catalogo";
import { CATEGORIAS_SAINT, codigoSaint } from "@/lib/categoriasSaint";
import { nombreLegible } from "@/lib/nombresSaint";
import { agrupar, type Grupo } from "@/lib/agrupaciones";

// Productos REALES de Saint, por categoría (las del mapa de lib/categoriasSaint.ts). Solo se usa desde lib/catalogo.ts
// y lib/tasa.ts. Responsable: persona A.
//
// PRODUCTOS_API_URL (en .env.local y en Vercel) ya trae la clave; se le suma &categoria=CODIGO. Se pide SOLO desde el
// servidor de Next: la clave nunca llega al navegador. Responde
//   { tasa, categoria, total, subcategorias: [{ codigo, nombre, cantidad }],
//     productos: [{ codigo, nombre, marca, codSubcategoria, subcategoria, precioBs, precioUsd }] }
// precioBs ya incluye IVA y precioUsd = precioBs / tasa.
//
// Rendimiento: la respuesta (≈600 KB con 3.177 herramientas) se guarda en la caché de Next 10 minutos. Encima, la
// lista ya convertida (nombres legibles, claves de búsqueda) queda en memoria y se reutiliza mientras la respuesta no
// cambie; así filtrar, ordenar y paginar en cada visita toma milisegundos, y la búsqueda y las recomendaciones
// (lib/recomendaciones/) reciben la MISMA lista y no se vuelven a preparar. Si Saint no responde, se sigue usando la
// última lista buena; si nunca hubo una, se lanza ErrorSaint (la página muestra "No pudimos cargar los productos").
//
// NUNCA se copian existencias ni cantidades de inventario: de cada producto solo se toman los campos de abajo.

const API_URL = process.env.PRODUCTOS_API_URL;
const REVALIDAR_SEGUNDOS = 600;
/** Cada cuánto se vuelve a mirar la caché de Next (barato: si la respuesta no cambió, se reutiliza la lista). */
const MEMORIA_MS = 60_000;
const ESPERA_MAXIMA_MS = 15_000;

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
  /** Con su nombre legible y la cantidad de productos que trae Saint (un grupo cuenta como uno). */
  subcategorias: { nombre: string; cantidad: number }[];
};

type Guardada = { datos: CategoriaSaint; texto: string; revisar: number };
const guardadas = new Map<number, Guardada>();
const pedidos = new Map<number, Promise<CategoriaSaint>>();

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
    subcategorias.push({ nombre: legible, cantidad: Math.max(0, Math.trunc(numero(cantidad)) || 0) });
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

async function pedir(slug: string, codigo: number): Promise<CategoriaSaint> {
  if (!API_URL) throw new ErrorSaint("Falta PRODUCTOS_API_URL");
  const url = new URL(API_URL);
  url.searchParams.set("categoria", String(codigo));

  let texto: string;
  try {
    const respuesta = await fetch(url, {
      next: { revalidate: REVALIDAR_SEGUNDOS, tags: [`saint-${codigo}`] },
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
    });
    // El mensaje nunca lleva la URL: tiene la clave.
    if (!respuesta.ok) throw new ErrorSaint(`Saint respondió ${respuesta.status} (categoría ${codigo})`);
    texto = await respuesta.text();
  } catch (error) {
    if (error instanceof ErrorSaint) throw error;
    throw new ErrorSaint(`No se pudo conectar con Saint (categoría ${codigo})`);
  }

  const anterior = guardadas.get(codigo);
  // La misma respuesta de antes (caché de Next): se reutiliza la lista ya convertida.
  if (anterior && anterior.texto === texto) {
    anterior.revisar = Date.now() + MEMORIA_MS;
    return anterior.datos;
  }
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    throw new ErrorSaint(`Saint respondió algo que no es JSON (categoría ${codigo})`);
  }
  const datos = convertir(slug, crudo);
  guardadas.set(codigo, { datos, texto, revisar: Date.now() + MEMORIA_MS });
  return datos;
}

/** Productos de Saint de una categoría de la web. Lanza ErrorSaint si no hay datos (ni nuevos ni guardados). */
export async function getCategoriaSaint(slug: string): Promise<CategoriaSaint> {
  const codigo = codigoSaint(slug);
  if (codigo === undefined) throw new ErrorSaint(`La categoría "${slug}" no tiene código de Saint`);

  const guardada = guardadas.get(codigo);
  if (guardada && guardada.revisar > Date.now()) return guardada.datos;

  // Varias visitas a la vez comparten un solo pedido.
  let pedido = pedidos.get(codigo);
  if (!pedido) {
    pedido = pedir(slug, codigo)
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
 * Todos los productos de Saint (todas las categorías del mapa), para el índice de búsqueda, el carrito y los favoritos.
 * `completo: false` si alguna categoría no se pudo cargar (sus productos faltan en la lista).
 */
export async function getTodosSaint(): Promise<{ listas: CategoriaSaint[]; completo: boolean }> {
  const resultados = await Promise.allSettled(Object.keys(CATEGORIAS_SAINT).map((slug) => getCategoriaSaint(slug)));
  const listas = resultados.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  for (const r of resultados) if (r.status === "rejected") console.error("[saint]", r.reason instanceof Error ? r.reason.message : r.reason);
  return { listas, completo: listas.length === resultados.length };
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
