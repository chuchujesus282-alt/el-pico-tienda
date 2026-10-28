import type { Producto } from "@/types/catalogo";
import { sugerirCorrigiendo, type IndiceBusqueda } from "@/lib/recomendaciones/busqueda";
import { tePuedeInteresar } from "@/lib/recomendaciones/interesar";
import { validarSenales } from "@/lib/recomendaciones/perfil";
import type { Senal } from "@/lib/recomendaciones/tipos";

// Lo que responden /api/sugerencias, /api/te-puede-interesar y /api/favoritos, sin tocar la red ni el índice real:
// reciben el índice (o null si todavía no está listo) y lo que mandó el navegador, ya validado aquí. Las rutas solo lo
// conectan (ver lib/indiceServidor.ts). Aparte para poder probarlo con Vitest. Responsable: persona A.
// Ninguna de estas respuestas registra eventos para análisis: la búsqueda se registra en /buscar (ver docs/eventos.md).

/** Más largo que esto no es una búsqueda real (y así nadie manda textos enormes). */
export const LARGO_MAXIMO_CONSULTA = 80;
export const MAXIMO_SUGERENCIAS = 6;
/** Lo que el cliente miró: solo las más recientes cuentan (el resto casi no pesa en el puntaje). */
export const MAXIMO_SENALES = 50;
export const MAXIMO_EN_CARRITO = 100;
export const MAXIMO_FAVORITOS = 200;
const LARGO_MAXIMO_ID = 64;

/** Solo lo que necesita la fila de una sugerencia (foto, nombre y precio; el enlace va por id). */
export type ProductoSugerido = Pick<
  Producto,
  "id" | "titulo" | "nombre" | "marca" | "precio" | "imagen" | "categoriaSlug" | "subcategoria"
>;

export type RespuestaSugerencias = {
  productos: ProductoSugerido[];
  /** Texto corregido ("martiyo" → "martillo") si hizo falta; null si no. */
  correccion: string | null;
  /** false: el índice se está armando; el navegador puede reintentar en un momento. */
  listo: boolean;
};

const paraSugerencia = ({ id, titulo, nombre, marca, precio, imagen, categoriaSlug, subcategoria }: Producto): ProductoSugerido => ({
  id,
  titulo,
  nombre,
  marca,
  precio,
  imagen,
  categoriaSlug,
  subcategoria,
});

/**
 * Lo que usa ProductCard ("Te puede interesar" y Favoritos). La descripción, cuando la base de datos la traiga, NO
 * viaja: con muchos productos haría la respuesta varias veces más pesada.
 */
export const paraTarjeta = ({ id, nombre, titulo, marca, precio, imagen, categoriaSlug, subcategoria, ventas }: Producto): Producto => ({
  id,
  nombre,
  titulo,
  marca,
  precio,
  imagen,
  categoriaSlug,
  subcategoria,
  ventas,
});

/** `?q=` → texto limpio: sin espacios de más y como mucho LARGO_MAXIMO_CONSULTA caracteres. */
export function limpiarConsulta(q: unknown): string {
  if (typeof q !== "string") return "";
  return q.replace(/\s+/g, " ").trim().slice(0, LARGO_MAXIMO_CONSULTA).trim();
}

/** Sugerencias del buscador del header. Índice no listo → vacío y `listo: false` (sin esperar). */
export function responderSugerencias(indice: IndiceBusqueda | null, q: string): RespuestaSugerencias {
  const listo = indice !== null;
  // Menos de 2 letras: todavía no es una búsqueda (el buscador tampoco las pide).
  if (!indice || q.replace(/\s/g, "").length < 2) return { productos: [], correccion: null, listo };
  const { productos, correccion } = sugerirCorrigiendo(indice, q, MAXIMO_SUGERENCIAS);
  return { productos: productos.map(paraSugerencia), correccion, listo };
}

const esId = (v: unknown): v is string => typeof v === "string" && v.trim() !== "" && v.length <= LARGO_MAXIMO_ID;

/** Códigos de producto que manda el navegador: solo textos cortos, sin repetir, como mucho `maximo`. */
export function leerIds(datos: unknown, maximo: number): string[] {
  if (!Array.isArray(datos)) return [];
  return [...new Set(datos.filter(esId).map((id) => id.trim()))].slice(0, maximo);
}

/**
 * Lo que el cliente miró (de su navegador): solo señales con la forma correcta (validarSenales), las MAXIMO_SENALES más
 * recientes, con códigos y términos cortos.
 */
export function leerSenales(datos: unknown): Senal[] {
  return validarSenales(datos)
    .filter((s) => (s.id === undefined || esId(s.id)) && (s.termino === undefined || s.termino.length <= LARGO_MAXIMO_CONSULTA))
    .sort((a, b) => b.fecha - a.fecha)
    .slice(0, MAXIMO_SENALES);
}

/** "Te puede interesar" con el perfil del cliente. Sin índice listo → null (el navegador se queda con los más vendidos). */
export function responderInteresar(indice: IndiceBusqueda | null, senales: Senal[], enCarrito: string[]): Producto[] | null {
  if (!indice) return null;
  return tePuedeInteresar({ productos: indice.productos, senales, enCarrito, indice, limite: 10 }).map(paraTarjeta);
}

const mapas = new WeakMap<Producto[], Map<string, Producto>>();
/** Producto por código, armado una vez por lista (la misma lista se reutiliza mientras el catálogo no cambie). */
function porId(productos: Producto[]): Map<string, Producto> {
  let mapa = mapas.get(productos);
  if (!mapa) {
    mapa = new Map(productos.map((p) => [p.id, p]));
    mapas.set(productos, mapa);
  }
  return mapa;
}

/**
 * Favoritos: los productos de esos códigos, en el mismo orden. Los que no están en el catálogo no se devuelven; con
 * `completo: false` (faltó una parte del catálogo) eso NO quiere decir que ya no existan.
 */
export function elegirFavoritos(productos: Producto[], ids: string[]): Producto[] {
  const mapa = porId(productos);
  return ids.flatMap((id) => {
    const producto = mapa.get(id);
    return producto ? [paraTarjeta(producto)] : [];
  });
}
