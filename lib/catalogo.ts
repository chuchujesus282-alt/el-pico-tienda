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

// ÚNICA puerta de entrada a los datos de productos (ver docs/datos.md).
// Sin CATALOGO_API_URL usa los datos de lib/mock/; con ella, consulta la API
// desde el servidor de Next (la URL y el token nunca llegan al navegador).

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

export async function getCategorias(): Promise<Categoria[]> {
  if (!API_URL) return categoriasMock;
  return pedirApi<Categoria[]>("/categorias");
}

export async function getProductosDestacados(seccion: string, limite = 10): Promise<Producto[]> {
  if (!API_URL) {
    const ids = destacadosMock[seccion];
    const productos = ids
      ? ids.map((id) => productosMock.find((p) => p.id === id)).filter((p): p is Producto => !!p)
      : productosMock;
    return productos.slice(0, limite);
  }
  return pedirApi<Producto[]>(`/productos/destacados${query({ seccion, limite })}`);
}

export async function getProductosPorCategoria(
  slug: string,
  opciones: OpcionesCategoria = {},
): Promise<ResultadoCategoria> {
  const { pagina = 1, porPagina = POR_PAGINA_DEFECTO, marca, subcategoria, orden = "relevancia" } = opciones;

  if (API_URL) {
    return pedirApi<ResultadoCategoria>(
      `/categorias/${encodeURIComponent(slug)}/productos${query({ pagina, porPagina, marca, subcategoria, orden })}`,
    );
  }

  const deCategoria = productosMock.filter((p) => p.categoriaSlug === slug);
  const marcas = [...new Set(deCategoria.map((p) => p.marca).filter((m): m is string => !!m))].sort();
  const subcategorias = [
    ...new Set(deCategoria.map((p) => p.subcategoria).filter((s): s is string => !!s)),
  ].sort();

  const filtrados = deCategoria
    .filter((p) => !marca || p.marca === marca)
    .filter((p) => !subcategoria || p.subcategoria === subcategoria);

  const ordenados = [...filtrados];
  if (orden === "precio-asc") ordenados.sort((a, b) => a.precio - b.precio);
  if (orden === "precio-desc") ordenados.sort((a, b) => b.precio - a.precio);
  if (orden === "nombre") ordenados.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const inicio = (pagina - 1) * porPagina;
  return {
    productos: ordenados.slice(inicio, inicio + porPagina),
    total: ordenados.length,
    pagina,
    porPagina,
    marcas,
    subcategorias,
  };
}

export async function getProducto(id: string): Promise<Producto | null> {
  if (!API_URL) return productosMock.find((p) => p.id === id) ?? null;
  try {
    return await pedirApi<Producto>(`/productos/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ErrorCatalogo && error.estado === 404) return null;
    throw error;
  }
}

// --- Búsqueda y recomendaciones (lib/recomendaciones/) ---
// Los algoritmos reciben los productos de estas funciones: al conectar el SQL solo cambia este archivo.

/** Todos los productos del catálogo, para buscar y recomendar (en la API: GET /productos/indice). */
export async function getIndiceProductos(): Promise<Producto[]> {
  if (!API_URL) return productosMock;
  return pedirApi<Producto[]>("/productos/indice");
}

/** Los más vendidos, de toda la tienda o de una categoría. */
export async function getMasVendidos(limite = 10, categoria?: string): Promise<Producto[]> {
  if (!API_URL) {
    return masVendidos(productosMock, limite, { categoria });
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
