import "server-only";

import destacadosJson from "@/datos/destacados.json";
import type {
  Categoria,
  CompradoJunto,
  OpcionesCategoria,
  Producto,
  ResultadoCategoria,
} from "@/types/catalogo";
import { categorias } from "@/lib/categorias";
import { diaDeHoy, elegirDestacados } from "@/lib/destacados";
import { type CategoriaSaint, esCategoriaSaint, getCategoriaSaint, getTodosSaint, normalizar } from "@/lib/saint";
import { esIdGrupo, type Grupo } from "@/lib/agrupaciones";
import { codigoPorNombre, navegacion } from "@/lib/arbolSaint";

// ÚNICA puerta de entrada a los datos de productos (ver docs/datos.md).
// TODAS las categorías traen sus productos REALES de Saint (lib/saint.ts; mapa en lib/categoriasSaint.ts). Ya no hay
// productos de ejemplo. Si Saint no responde, se lanza el error y la página muestra "No pudimos cargar los productos";
// NUNCA se muestran productos inventados en su lugar.

const POR_PAGINA_DEFECTO = 24;

export class ErrorCatalogo extends Error {
  constructor(mensaje: string, public readonly estado?: number) {
    super(mensaje);
    this.name = "ErrorCatalogo";
  }
}

/** Las categorías de la tienda, en el orden del menú (lib/categorias.ts). */
export async function getCategorias(): Promise<Categoria[]> {
  return categorias;
}

/** Códigos elegidos a mano para cada sección del inicio (datos/destacados.json, editable sin programar). */
const DESTACADOS = destacadosJson as unknown as Record<string, unknown>;
function codigosDe(seccion: string): string[] {
  const lista = DESTACADOS[seccion];
  return Array.isArray(lista) ? lista.filter((c): c is string => typeof c === "string" && c.trim() !== "") : [];
}

/**
 * Productos destacados de una sección del inicio ("recomendados", "te-puede-interesar" o el slug de una categoría):
 * los códigos de datos/destacados.json y, si faltan, la mezcla automática del día (lib/destacados.ts). Mientras no haya
 * "Más vendidos" de Saint, esto reemplaza a los productos de ejemplo de antes.
 */
export async function getProductosDestacados(seccion: string, limite = 10): Promise<Producto[]> {
  const { productos } = await getIndiceConEstado();
  return elegirDestacados(productos, {
    codigos: codigosDe(seccion),
    categoria: esCategoriaSaint(seccion) ? seccion : undefined,
    limite,
    dia: diaDeHoy(),
    semilla: seccion,
  });
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
  /** Si viene: solo los productos (por posición) que están en el nivel elegido del árbol o debajo. */
  enNivel?: (i: number) => boolean,
): Pick<ResultadoCategoria, "productos" | "total" | "pagina" | "porPagina"> {
  const { pagina = 1, porPagina = POR_PAGINA_DEFECTO, marca, subcategoria, orden = "relevancia", q } = opciones;
  // Cada palabra buscada tiene que aparecer (en el nombre, el código o la marca), en cualquier orden.
  const palabras = q ? normalizar(q).split(/\s+/).filter(Boolean) : [];

  const filtrados = productos.filter(
    (p, i) =>
      (!marca || p.marca === marca) &&
      (enNivel ? enNivel(i) : !subcategoria || p.subcategoria === subcategoria) &&
      palabras.every((palabra) => claves[i].includes(palabra)),
  );

  if (orden === "precio-asc") filtrados.sort((a, b) => a.precio - b.precio);
  if (orden === "precio-desc") filtrados.sort((a, b) => b.precio - a.precio);
  if (orden === "nombre") filtrados.sort((a, b) => ordenAlfabetico.compare(a.titulo ?? a.nombre, b.titulo ?? b.nombre));

  const inicio = (pagina - 1) * porPagina;
  return { productos: filtrados.slice(inicio, inicio + porPagina), total: filtrados.length, pagina, porPagina };
}

/**
 * Una página de productos de la categoría. Pide a Saint SOLO esa categoría (lib/saint.ts): cada página carga lo suyo y
 * si una categoría falla, las demás siguen. Si Saint no responde y no hay lista guardada, lanza el error.
 */
export async function getProductosPorCategoria(
  slug: string,
  opciones: OpcionesCategoria = {},
): Promise<ResultadoCategoria> {
  if (!esCategoriaSaint(slug)) {
    return { productos: [], total: 0, pagina: 1, porPagina: opciones.porPagina ?? POR_PAGINA_DEFECTO, marcas: [], subcategorias: [] };
  }
  const saint = await getCategoriaSaint(slug);
  // Nivel del árbol de Saint (?sub=1503). Los enlaces viejos (?subcategoria=Nombre) se traducen a su primer nivel. Un
  // código que no está en esta categoría (o que quedó sin productos) es "Todas".
  const pedido = opciones.sub ?? (opciones.subcategoria ? codigoPorNombre(saint.arbol, opciones.subcategoria) : undefined);
  const sub = pedido !== undefined && saint.arbol.nodos.has(pedido) ? pedido : undefined;
  return {
    // La lista agrupada: cada grupo de medidas (lib/agrupaciones.ts) es una sola tarjeta. En un nivel, lo de esa
    // instancia y lo de todas las de abajo.
    ...filtrarYPaginar(saint.listado, saint.clavesListado, opciones, (i) => sub === undefined || saint.ancestrosListado[i].has(sub)),
    marcas: [], // por ahora sin filtro de marca en las categorías de Saint
    subcategorias: saint.subcategorias.map((s) => s.nombre),
    navegacion: navegacion(saint.arbol, sub),
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
  const { listas } = await getTodosSaint();
  for (const lista of listas) {
    const grupo = lista.grupos.get(esIdGrupo(id) ? id : (lista.grupoDe.get(id) ?? ""));
    if (grupo) return { grupo, seleccion: esIdGrupo(id) ? grupo.variantes[0].id : id };
  }
  return null;
}

/**
 * Un producto por su código (o la tarjeta de un grupo de medidas). El código no dice de qué categoría es, así que se
 * busca en la lista con TODAS (la del índice, en memoria). null: no existe.
 */
export async function getProducto(id: string): Promise<Producto | null> {
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
  return null;
}

// --- Búsqueda y recomendaciones (lib/recomendaciones/, con el índice de lib/indiceServidor.ts) ---
// Los algoritmos reciben los productos de estas funciones: al conectar el SQL solo cambia este archivo.

/** La última lista unida: se devuelve la MISMA mientras ninguna categoría cambie (así el índice no se rehace). */
let indiceUnido: { partes: Producto[][]; productos: Producto[] } | null = null;

/**
 * Todos los productos de la tienda (las 10 categorías de Saint), para buscar, recomendar, y armar el carrito y los
 * favoritos de la cuenta. `completo: false` si alguna categoría no cargó: sus productos faltan (no es que no existan).
 */
export async function getIndiceConEstado(): Promise<{ productos: Producto[]; completo: boolean }> {
  const { listas, completo } = await getTodosSaint();
  const partes = listas.map((l) => l.productos);
  const iguales =
    indiceUnido && indiceUnido.partes.length === partes.length && indiceUnido.partes.every((p, i) => p === partes[i]);
  if (!iguales) indiceUnido = { partes, productos: partes.flat() };
  return { productos: indiceUnido!.productos, completo };
}

/** Todos los productos del catálogo, para buscar y recomendar. */
export async function getIndiceProductos(): Promise<Producto[]> {
  return (await getIndiceConEstado()).productos;
}

/**
 * Productos que suelen pedirse junto con este. Todavía no hay fuente: devuelve [] (los relacionados salen igual de
 * lib/recomendaciones/). PENDIENTE: alimentarlo con los eventos "pedido_enviado" (mismo `pedido_codigo`; consulta
 * "¿Qué productos se piden juntos?" en docs/eventos.md), sin hacer esperar a la página de producto.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCompradosJuntos(id: string, limite = 8): Promise<CompradoJunto[]> {
  return [];
}
