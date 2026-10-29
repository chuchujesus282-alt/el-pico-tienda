import "server-only";

import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { Producto } from "@/types/catalogo";
import { CATEGORIAS_SAINT, codigoSaint } from "@/lib/categoriasSaint";
import { nombreLegible } from "@/lib/nombresSaint";
import { agrupar, type Grupo } from "@/lib/agrupaciones";
import { repartirPorCategoria } from "@/lib/repartirSaint";
import { ancestros, armarArbol, type ArbolSaint } from "@/lib/arbolSaint";
import { crearAlmacenSaint, type EntradaSaint, type LecturaSaint } from "@/lib/almacenSaint";
import { enTandas, esCodigoValido, leerPrecios, type PrecioAlDia } from "@/lib/preciosSaint";

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
// Cada categoría se pide y se guarda POR SEPARADO (con las 10 son 11.777 productos; la más grande, Herramientas, ocupa
// ~0,8 MB en la caché, el 39% del límite de 2 MB):
// - getCategoriaSaint(slug): la de una página de categoría.
// - getTodosSaint(): el índice (buscador, "Te puede interesar", carrito, favoritos, destacados, página de producto)
//   JUNTA las 10 guardadas; ya no hay un pedido con todas.
// Capas (lógica en lib/almacenSaint.ts, con pruebas): memoria de este servidor (la lista ya convertida, revisada cada
// minuto) → caché compartida entre servidores (unstable_cache, 10 minutos) → Saint. Los precios son los REALES de venta:
// si lo guardado tiene más de 15 minutos, esa visita espera a Saint. Si Saint falla se sirve lo guardado (vencido o
// en memoria); si nunca hubo nada, ErrorSaint (la página muestra "No pudimos cargar los productos").
// La lista convertida se reutiliza mientras la respuesta no cambie (huella): filtrar y paginar toma milisegundos y la
// búsqueda (lib/indiceServidor.ts) recibe la MISMA lista y no se vuelve a preparar.
// Al enviar un pedido, el precio de cada producto se consulta al momento con &codigos= (preciosAlDia, abajo).
//
// NUNCA se copian existencias ni cantidades de inventario: de cada producto solo se toman los campos de abajo.

const API_URL = process.env.PRODUCTOS_API_URL;
/** Cada cuánto se renueva la caché compartida de una categoría (en segundo plano). */
const REVALIDAR_SEGUNDOS = 600;
/** Tope de antigüedad: más viejo que esto, la visita espera el pedido nuevo a Saint (precios reales de venta). */
const TOPE_MS = 15 * 60_000;
/** Cada cuánto la memoria de este servidor vuelve a mirar la caché compartida (una lectura por red en Vercel). */
const MEMORIA_MS = 60_000;
const ESPERA_MAXIMA_MS = 20_000;
/** Aviso en los registros si una categoría se acerca al límite de 2 MB de la caché de Next. */
const AVISO_TAMANO = 1.5 * 1024 * 1024;
/** Sube este número si cambia lo que se guarda en la caché compartida (así no se leen entradas con el formato viejo). */
const VERSION_CACHE = "v1";

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
  /** Árbol completo de subcategorías de Saint (instancias, todos los niveles), sin las ramas vacías (lib/arbolSaint.ts). */
  arbol: ArbolSaint;
  /** Para cada tarjeta de `listado` (mismo orden): su instancia y todas las de arriba. Un grupo junta las de sus medidas. */
  ancestrosListado: Set<number>[];
};

/** "Llave ALLEN Combinada" → "llave allen combinada"; "Medición" → "medicion". */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const esTexto = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const numero = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN);
const redondear = (n: number) => Math.round(n * 100) / 100;

/** Respuesta de Saint → lista lista para la tienda. Lo que no tenga código, nombre o precio válido se deja fuera. */
function convertir(slug: string, crudo: unknown): CategoriaSaint {
  const datos = (crudo ?? {}) as { tasa?: unknown; subcategorias?: unknown; instancias?: unknown; productos?: unknown };
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
  /** Instancia exacta de cada producto en el árbol de Saint (su `codInstancia`). */
  const instanciaDe = new Map<string, number>();
  for (const fila of datos.productos) {
    const { codigo, nombre, marca, codSubcategoria, subcategoria, codInstancia, precioBs, precioUsd } = (fila ?? {}) as Record<string, unknown>;
    if (!esTexto(codigo) || !esTexto(nombre)) continue;
    const id = codigo.trim();
    const precio = numero(precioUsd);
    if (vistos.has(id) || !Number.isFinite(precio) || precio <= 0) continue;
    vistos.add(id);
    const instancia = numero(codInstancia);
    if (Number.isFinite(instancia)) instanciaDe.set(id, instancia);

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

  // Árbol de subcategorías (todos los niveles) y, para cada tarjeta, en qué niveles está: así la página filtra por
  // cualquier nivel (?sub=1503) mostrando lo de esa instancia y lo de todas las de abajo.
  const arbol = armarArbol(Array.isArray(datos.instancias) ? datos.instancias : [], codigoSaint(slug) ?? NaN, instanciaDe.values(), (n) => nombreLegible(n));
  const ancestrosListado = listado.map((p) => {
    const grupo = grupos.get(p.id);
    if (!grupo) return ancestros(arbol, instanciaDe.get(p.id));
    const todos = new Set<number>();
    for (const v of grupo.variantes) for (const c of ancestros(arbol, instanciaDe.get(v.id))) todos.add(c);
    return todos;
  });

  return {
    tasa: Number.isFinite(tasa) && tasa > 0 ? tasa : 0,
    productos,
    claves,
    listado,
    clavesListado,
    grupos,
    grupoDe,
    subcategorias,
    arbol,
    ancestrosListado,
  };
}

/**
 * Pide a Saint SIN caché (no-store: la respuesta no se guarda con su URL, que tiene la clave) y devuelve el texto. El
 * mensaje de error nunca lleva la URL.
 */
async function pedirTexto(parametros: Record<string, string>, etiqueta: string, esperaMs = ESPERA_MAXIMA_MS): Promise<string> {
  if (!API_URL) throw new ErrorSaint("Falta PRODUCTOS_API_URL");
  const url = new URL(API_URL);
  for (const [clave, valor] of Object.entries(parametros)) url.searchParams.set(clave, valor);
  try {
    const respuesta = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(esperaMs) });
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

const slugPorCodigo = new Map(Object.entries(CATEGORIAS_SAINT).map(([slug, codigo]) => [codigo, slug]));
const MB = (caracteres: number) => `${(caracteres / 1e6).toFixed(2)} MB`;

/**
 * UNA categoría, directo a Saint. Se guarda solo su parte (lo que traiga otra codCategoria se descarta) con la huella
 * del texto y la hora: es lo que guarda la caché compartida.
 */
async function pedirCategoria(codigo: number): Promise<EntradaSaint> {
  const slug = slugPorCodigo.get(codigo) ?? String(codigo);
  const inicio = performance.now();
  const texto = await pedirTexto({ categoria: String(codigo) }, `categoría ${codigo}`);
  const ms = Math.round(performance.now() - inicio);
  const crudo = repartirPorCategoria(leerJson(texto, `categoría ${codigo}`), { [slug]: codigo }).get(slug);
  const entrada: EntradaSaint = {
    crudo,
    huella: createHash("sha1").update(texto).digest("hex"),
    pedidoEn: Date.now(),
    caracteres: texto.length,
  };
  // La caché de Next no guarda entradas de más de 2 MB (las mide ya pasadas a JSON): aviso con margen.
  const tamano = JSON.stringify(entrada).length;
  if (tamano > AVISO_TAMANO) {
    console.warn(
      `[saint] aviso · ${slug} pesa ${MB(tamano)} en la caché compartida (límite 2 MB). Hay que partirla o guardar las filas ` +
        "como listas (ver lib/saint.ts).",
    );
  }
  console.info(`[saint] tiempo · ${slug} · pedido a Saint ${ms} ms · ${MB(texto.length)}`);
  return entrada;
}

/**
 * Caché COMPARTIDA entre servidores, una entrada por categoría. La clave es la que se elige aquí (nunca la URL: tiene
 * la clave de Saint) y las etiquetas sirven para invalidarla (app/api/saint/invalidar).
 *
 * OJO: `unstable_cache` está marcado como reemplazado por "use cache" en Next 16, pero sigue funcionando. Conviene
 * pasar a "use cache" cuando la tienda encienda `cacheComponents` (obliga a revisar todas las páginas) o antes si una
 * versión de Next anuncia que lo quita. El cambio es directo: `"use cache"` + `cacheLife({ revalidate: 600, expire: 900 })`
 * + `cacheTag(...)`, y el `expire` de 900 s haría solo el tope de 15 minutos (TOPE_MS en lib/almacenSaint.ts).
 */
const compartidas = new Map<number, () => Promise<EntradaSaint>>();
function leerCompartida(codigo: number): Promise<EntradaSaint> {
  let leer = compartidas.get(codigo);
  if (!leer) {
    leer = unstable_cache(() => pedirCategoria(codigo), ["saint-categoria", VERSION_CACHE, String(codigo)], {
      revalidate: REVALIDAR_SEGUNDOS,
      tags: [ETIQUETA_SAINT, etiquetaCategoria(codigo)],
    });
    compartidas.set(codigo, leer);
  }
  return leer();
}

/** Etiqueta de la caché compartida de una categoría (para invalidarla). */
export const etiquetaCategoria = (codigo: number) => `saint-${codigo}`;
export const ETIQUETA_SAINT = "saint";

// Las páginas y las rutas de API cargan cada una su propia copia de este archivo: la memoria va en globalThis para que
// haya UNA por servidor (así /api/saint/invalidar la vacía para todos al momento y nada se convierte dos veces).
type MemoriaServidor = {
  almacen: ReturnType<typeof crearAlmacenSaint<CategoriaSaint>>;
  preciosRecientes: Map<string, { precio: PrecioAlDia | null; en: number }>;
};
const memoriaGlobal = globalThis as typeof globalThis & { __elPicoSaint?: MemoriaServidor };
const { almacen, preciosRecientes } = (memoriaGlobal.__elPicoSaint ??= {
  almacen: crearAlmacenSaint<CategoriaSaint>({
    leerCompartida,
    pedirDirecto: pedirCategoria,
    convertir,
    revisarCadaMs: MEMORIA_MS,
    topeMs: TOPE_MS,
    registrar: registrarLectura,
    avisarFallo: (slug, error) =>
      console.error(`[saint] ${slug}: ${error instanceof Error ? error.message : error}; se usa la última lista buena.`),
  }),
  preciosRecientes: new Map(),
});

/**
 * Una línea en los registros (Vercel → Logs, buscar "[saint] tiempo") cada vez que una categoría se lee de la caché
 * compartida (como mucho una vez por minuto y por categoría en cada servidor). Solo tiempos y tamaños, nunca la URL.
 */
function registrarLectura(l: LecturaSaint) {
  const origen = {
    cache: `caché ${l.msLectura} ms`,
    saint: `caché vacía → Saint ${l.msLectura} ms`,
    tope: `caché ${l.msLectura} ms, pasaba de 15 min → Saint ${l.msDirecto} ms`,
    vencida: `caché ${l.msLectura} ms, pasaba de 15 min y Saint no respondió (${l.msDirecto} ms) → se sirve la guardada`,
  }[l.origen];
  const convertirTexto = l.msConvertir === undefined ? "sin cambios" : `convertir ${l.msConvertir} ms`;
  console.info(
    `[saint] tiempo · ${l.slug} · ${origen} · ${MB(l.caracteres)} · ${convertirTexto} · guardada hace ${Math.round(l.edadMs / 60_000)} min`,
  );
}

/**
 * Productos de Saint de UNA categoría de la web (para su página y para armar la lista completa). Lanza ErrorSaint si
 * no hay datos (ni en Saint, ni en la caché compartida, ni en memoria).
 */
export async function getCategoriaSaint(slug: string): Promise<CategoriaSaint> {
  const codigo = codigoSaint(slug);
  if (codigo === undefined) throw new ErrorSaint(`La categoría "${slug}" no tiene código de Saint`);
  return almacen.categoria(slug, codigo);
}

/** ¿La categoría muestra productos de Saint? */
export const esCategoriaSaint = (slug: string) => codigoSaint(slug) !== undefined;

/**
 * Todos los productos de Saint (las categorías del mapa), para el índice de búsqueda, el carrito, los favoritos y los
 * destacados: se JUNTAN las categorías guardadas, sin pedir todo a Saint. Mientras nada cambie, las mismas listas.
 * `completo: false` si alguna categoría falta (sus productos no es que no existan).
 */
export async function getTodosSaint(): Promise<{ listas: CategoriaSaint[]; completo: boolean }> {
  const { listas, completo, fallidas } = await almacen.todas(CATEGORIAS_SAINT);
  if (fallidas.length > 0) console.error(`[saint] sin datos de: ${fallidas.join(", ")}`);
  return { listas, completo };
}

/**
 * Olvida lo que este servidor tiene en memoria (de una categoría o de todas). Lo usa app/api/saint/invalidar, junto con
 * revalidateTag; los demás servidores lo notan en su próxima revisión (como mucho MEMORIA_MS).
 */
export function olvidarSaint(codigo?: number) {
  almacen.olvidar(codigo);
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

// --- Precios al día de productos sueltos (finalizar pedido y pedido guardado) ---

/** Lo ya preguntado hace menos de esto se reutiliza: protege a Saint si muchos clientes abren el pago a la vez. */
const PRECIOS_VIGENCIA_MS = 30_000;
/** Si Saint tarda más, se sigue con los precios que tenía el cliente (nunca se frena una venta). */
const PRECIOS_ESPERA_MS = 4_000;
const categoriasPermitidas = new Set(Object.values(CATEGORIAS_SAINT));

export type ResultadoPrecios = {
  /** Precio de hoy de cada código que sigue a la venta. */
  precios: Map<string, PrecioAlDia>;
  /** Pedidos que Saint ya no vende (no vinieron en la respuesta). */
  retirados: string[];
  /** No se pudieron consultar (Saint no respondió o el código no es válido): se usa el precio que se tenía. */
  sinVerificar: string[];
};

/**
 * Precio ACTUAL de Saint (&codigos=, sin caché) de estos códigos: lo usan /api/precios-al-dia (antes de enviar por
 * WhatsApp) y guardarPedido. Nunca lanza: lo que no se pudo consultar va en `sinVerificar`.
 */
export async function preciosAlDia(ids: string[]): Promise<ResultadoPrecios> {
  const precios = new Map<string, PrecioAlDia>();
  const retirados: string[] = [];
  const sinVerificar: string[] = [];
  const ahora = Date.now();
  const porPedir: string[] = [];
  for (const id of new Set(ids)) {
    if (!esCodigoValido(id)) {
      sinVerificar.push(id);
      continue;
    }
    const reciente = preciosRecientes.get(id);
    if (reciente && ahora - reciente.en < PRECIOS_VIGENCIA_MS) {
      if (reciente.precio) precios.set(id, reciente.precio);
      else retirados.push(id);
    } else porPedir.push(id);
  }

  const inicio = performance.now();
  await Promise.all(
    enTandas(porPedir).map(async (tanda) => {
      try {
        const texto = await pedirTexto({ codigos: tanda.join(",") }, "precios al día", PRECIOS_ESPERA_MS);
        const leidos = leerPrecios(leerJson(texto, "precios al día"), tanda, categoriasPermitidas);
        const en = Date.now();
        for (const [id, precio] of leidos.precios) {
          precios.set(id, precio);
          preciosRecientes.set(id, { precio, en });
        }
        for (const id of leidos.retirados) {
          retirados.push(id);
          preciosRecientes.set(id, { precio: null, en });
        }
      } catch (error) {
        console.error(`[saint] precios al día: ${error instanceof Error ? error.message : error}`);
        sinVerificar.push(...tanda);
      }
    }),
  );
  if (porPedir.length > 0) {
    console.info(
      `[saint] tiempo · precios al día · ${porPedir.length} códigos · ${Math.round(performance.now() - inicio)} ms` +
        `${sinVerificar.length ? ` · ${sinVerificar.length} sin verificar` : ""}${retirados.length ? ` · ${retirados.length} ya no a la venta` : ""}`,
    );
  }
  // Que no crezca sin fin: se limpia lo vencido de vez en cuando.
  if (preciosRecientes.size > 5_000) {
    for (const [id, { en }] of preciosRecientes) if (ahora - en >= PRECIOS_VIGENCIA_MS) preciosRecientes.delete(id);
  }
  return { precios, retirados, sinVerificar };
}
