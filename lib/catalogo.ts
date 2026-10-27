import "server-only";

import type {
  Categoria,
  CompradoJunto,
  OpcionesCategoria,
  Producto,
  ResultadoCategoria,
} from "@/types/catalogo";
import { categoriasMock } from "@/lib/mock/categorias";
import { destacadosMock, productosMock } from "@/lib/mock/productos";
import { masVendidos } from "@/lib/recomendaciones/productos";
import { type CategoriaSaint, esCategoriaSaint, getCategoriaSaint, getTodosSaint, normalizar } from "@/lib/saint";
import { esIdGrupo, type Grupo } from "@/lib/agrupaciones";

// ÚNICA puerta de entrada a los datos de productos (ver docs/datos.md).
// - Las categorías del mapa lib/categoriasSaint.ts (hoy: Herramientas) traen sus productos REALES de Saint
//   (lib/saint.ts). Si Saint no responde, se lanza el error y la página muestra "No pudimos cargar los productos";
//   NUNCA se muestran productos de ejemplo en su lugar.
// - Las demás: sin CATALOGO_API_URL usan los datos de lib/mock/; con ella, consultan la API
//   desde el servidor de Next (la URL y el token nunca llegan al navegador).

const API_URL = process.env.CATALOGO_API_URL?.replace(/\/$/, "");
const API_TOKEN = process.env.CATALOGO_API_TOKEN;
const REVALIDAR_SEGUNDOS = 300;
const POR_PAGINA_DEFECTO = 24;

export class ErrorCatalogo extends Error {
  constructor(mensaje: string, public readonly estado?: number) {
    super(mensaje);
    this.name = "ErrorCatalogo";
  }
}

async function pedirApi<T>(ruta: string): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { Authorization: `Bearer ${API_TOKEN ?? ""}` },
      next: { revalidate: REVALIDAR_SEGUNDOS },
    });
  } catch {
    throw new ErrorCatalogo(`No se pudo conectar con el catálogo (${ruta})`);
  }
  if (!respuesta.ok) {
    throw new ErrorCatalogo(`El catálogo respondió ${respuesta.status} (${ruta})`, respuesta.status);
  }
  return (await respuesta.json()) as T;
}

function query(params: Record<string, string | number | undefined>): string {
  const busqueda = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== "") busqueda.set(clave, String(valor));
  }
  const texto = busqueda.toString();
  return texto ? `?${texto}` : "";
}

/** Productos de ejemplo, sin los de las categorías que ya vienen de Saint. */
const productosEjemplo = productosMock.filter((p) => !esCategoriaSaint(p.categoriaSlug));

export async function getCategorias(): Promise<Categoria[]> {
  if (!API_URL) return categoriasMock;
  return pedirApi<Categoria[]>("/categorias");
}

export async function getProductosDestacados(seccion: string, limite = 10): Promise<Producto[]> {
  if (!API_URL) {
    const ids = destacadosMock[seccion];
    const productos = ids
      ? ids.map((id) => productosEjemplo.find((p) => p.id === id)).filter((p): p is Producto => !!p)
      : productosEjemplo;
    return productos.slice(0, limite);
  }
  return pedirApi<Producto[]>(`/productos/destacados${query({ seccion, limite })}`);
}

const ordenAlfabetico = new Intl.Collator("es", { sensitivity: "base", numeric: true });

/**
 * Filtra (subcategoría, marca, búsqueda), ordena y corta la página. Al navegador solo llega la página pedida.
 * `claves`: texto normalizado de cada producto para la búsqueda (mismo orden que `productos`).
 */
function filtrarYPaginar(
  productos: Producto[],
  claves: string[],
  opciones: OpcionesCategoria,
): Pick<ResultadoCategoria, "productos" | "total" | "pagina" | "porPagina"> {
  const { pagina = 1, porPagina = POR_PAGINA_DEFECTO, marca, subcategoria, orden = "relevancia", q } = opciones;
  // Cada palabra buscada tiene que aparecer (en el nombre, el código o la marca), en cualquier orden.
  const palabras = q ? normalizar(q).split(/\s+/).filter(Boolean) : [];

  const filtrados = productos.filter(
    (p, i) =>
      (!marca || p.marca === marca) &&
      (!subcategoria || p.subcategoria === subcategoria) &&
      palabras.every((palabra) => claves[i].includes(palabra)),
  );

  if (orden === "precio-asc") filtrados.sort((a, b) => a.precio - b.precio);
  if (orden === "precio-desc") filtrados.sort((a, b) => b.precio - a.precio);
  if (orden === "nombre") filtrados.sort((a, b) => ordenAlfabetico.compare(a.titulo ?? a.nombre, b.titulo ?? b.nombre));

  const inicio = (pagina - 1) * porPagina;
  return { productos: filtrados.slice(inicio, inicio + porPagina), total: filtrados.length, pagina, porPagina };
}

const clavesEjemplo = new Map(productosEjemplo.map((p) => [p, normalizar(`${p.id} ${p.nombre} ${p.marca ?? ""}`)]));

export async function getProductosPorCategoria(
  slug: string,
  opciones: OpcionesCategoria = {},
): Promise<ResultadoCategoria> {
  if (esCategoriaSaint(slug)) {
    // Si Saint no responde y no hay lista guardada, el error llega a app/categoria/[slug]/error.tsx.
    const saint = await getCategoriaSaint(slug);
    return {
      // La lista agrupada: cada grupo de medidas (lib/agrupaciones.ts) es una sola tarjeta.
      ...filtrarYPaginar(saint.listado, saint.clavesListado, opciones),
      marcas: [], // por ahora sin filtro de marca en las categorías de Saint
      subcategorias: saint.subcategorias.map((s) => s.nombre),
      cantidades: Object.fromEntries(saint.subcategorias.map((s) => [s.nombre, s.cantidad])),
    };
  }

  const { pagina = 1, porPagina = POR_PAGINA_DEFECTO, marca, subcategoria, orden = "relevancia", q } = opciones;
  if (API_URL) {
    return pedirApi<ResultadoCategoria>(
      `/categorias/${encodeURIComponent(slug)}/productos${query({ pagina, porPagina, marca, subcategoria, orden, q })}`,
    );
  }

  const deCategoria = productosEjemplo.filter((p) => p.categoriaSlug === slug);
  const marcas = [...new Set(deCategoria.map((p) => p.marca).filter((m): m is string => !!m))].sort();
  const subcategorias = [
    ...new Set(deCategoria.map((p) => p.subcategoria).filter((s): s is string => !!s)),
  ].sort();

  return {
    ...filtrarYPaginar(deCategoria, deCategoria.map((p) => clavesEjemplo.get(p) ?? ""), opciones),
    marcas,
    subcategorias,
  };
}

/** Por código, para encontrar un producto de Saint sin recorrer la lista (una vez por lista). */
const porCodigo = new WeakMap<CategoriaSaint, Map<string, Producto>>();
function buscarEnSaint(lista: CategoriaSaint, id: string): Producto | undefined {
  let mapa = porCodigo.get(lista);
  if (!mapa) {
    mapa = new Map(lista.productos.map((p) => [p.id, p]));
    porCodigo.set(lista, mapa);
  }
  return mapa.get(id);
}

/**
 * Grupo de medidas de un producto (lib/agrupaciones.ts), por el id del grupo o por el código de cualquiera de sus
 * medidas. `seleccion`: el código de la medida que se abre marcada (la pedida, o la primera). null: no es de un grupo.
 */
export async function getGrupo(id: string): Promise<{ grupo: Grupo; seleccion: string } | null> {
  if (productosEjemplo.some((p) => p.id === id)) return null; // los de ejemplo nunca van agrupados
  const { listas } = await getTodosSaint();
  for (const lista of listas) {
    const grupo = lista.grupos.get(esIdGrupo(id) ? id : (lista.grupoDe.get(id) ?? ""));
    if (grupo) return { grupo, seleccion: esIdGrupo(id) ? grupo.variantes[0].id : id };
  }
  return null;
}

export async function getProducto(id: string): Promise<Producto | null> {
  if (!API_URL) {
    const ejemplo = productosEjemplo.find((p) => p.id === id);
    if (ejemplo) return ejemplo;
  }

  const { listas, completo } = await getTodosSaint();
  for (const lista of listas) {
    // La tarjeta de un grupo de medidas (su página elige la medida).
    const grupo = esIdGrupo(id) ? lista.grupos.get(id) : undefined;
    if (grupo) return grupo.tarjeta;
    const producto = buscarEnSaint(lista, id);
    if (producto) return producto;
  }
  // No está, pero alguna categoría de Saint no cargó: podría estar ahí. Mejor "intenta en unos minutos" que "no existe".
  if (!completo) throw new ErrorCatalogo(`No se pudo cargar el catálogo de Saint para buscar ${id}`);

  if (!API_URL) return null;
  try {
    return await pedirApi<Producto>(`/productos/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ErrorCatalogo && error.estado === 404) return null;
    throw error;
  }
}

// --- Búsqueda y recomendaciones (lib/recomendaciones/) ---
// Los algoritmos reciben los productos de estas funciones: al conectar el SQL solo cambia este archivo.

/*
 * El catálogo completo se guarda en memoria del servidor el mismo tiempo que la caché de la API (5 min).
 * Por qué: con miles de productos, cada respuesta de la API llega como una lista NUEVA, y la búsqueda y los
 * relacionados (lib/recomendaciones/) solo reutilizan su preparación (~200 ms con 4000 productos) si reciben la MISMA
 * lista. Así se prepara una vez cada 5 minutos y no en cada visita. Además: varias visitas a la vez comparten un solo
 * pedido, y si la API falla se sigue usando la última lista buena (la página no se cae). Si la lista pesa más de 2 MB,
 * la caché de fetch de Next no la guarda; esta memoria sí.
 */
let indiceGuardado: { productos: Producto[]; vence: number } | null = null;
let indicePedido: Promise<Producto[]> | null = null;

/** Productos de las categorías que NO vienen de Saint (ejemplo, o la API del catálogo si está configurada). */
async function getIndiceBase(): Promise<Producto[]> {
  if (!API_URL) return productosEjemplo;
  if (indiceGuardado && indiceGuardado.vence > Date.now()) return indiceGuardado.productos;
  indicePedido ??= pedirApi<Producto[]>("/productos/indice")
    .then((todos) => {
      const productos = todos.filter((p) => !esCategoriaSaint(p.categoriaSlug));
      indiceGuardado = { productos, vence: Date.now() + REVALIDAR_SEGUNDOS * 1000 };
      return productos;
    })
    .catch((error: unknown) => {
      if (indiceGuardado) return indiceGuardado.productos;
      throw error;
    })
    .finally(() => {
      indicePedido = null;
    });
  return indicePedido;
}

/** La última unión base + Saint: se devuelve la MISMA lista mientras ninguna de sus partes cambie. */
let indiceUnido: { partes: Producto[][]; productos: Producto[] } | null = null;

/**
 * Todos los productos de la tienda (base + Saint), para buscar, recomendar, y armar el carrito y los favoritos de la
 * cuenta. `completo: false` si alguna categoría de Saint no cargó: sus productos faltan (no es que no existan).
 */
export async function getIndiceConEstado(): Promise<{ productos: Producto[]; completo: boolean }> {
  const [base, { listas, completo }] = await Promise.all([getIndiceBase(), getTodosSaint()]);
  const partes = [base, ...listas.map((l) => l.productos)];
  const iguales =
    indiceUnido && indiceUnido.partes.length === partes.length && indiceUnido.partes.every((p, i) => p === partes[i]);
  if (!iguales) indiceUnido = { partes, productos: partes.flat() };
  return { productos: indiceUnido!.productos, completo };
}

/** Todos los productos del catálogo, para buscar y recomendar (en la API: GET /productos/indice). */
export async function getIndiceProductos(): Promise<Producto[]> {
  return (await getIndiceConEstado()).productos;
}

/** Los más vendidos, de toda la tienda o de una categoría. */
export async function getMasVendidos(limite = 10, categoria?: string): Promise<Producto[]> {
  if (!API_URL) {
    return masVendidos(productosEjemplo, limite, { categoria });
  }
  return pedirApi<Producto[]>(`/productos/mas-vendidos${query({ limite, categoria })}`);
}

/**
 * Productos que suelen ir en la misma factura (de las facturas del SQL). Mientras no haya datos devuelve [].
 * Si falla, también []: es un extra y no debe romper la página de producto.
 */
export async function getCompradosJuntos(id: string, limite = 8): Promise<CompradoJunto[]> {
  if (!API_URL) return [];
  try {
    return await pedirApi<CompradoJunto[]>(`/productos/${encodeURIComponent(id)}/comprados-juntos${query({ limite })}`);
  } catch {
    return [];
  }
}
