import type { Producto } from "@/types/catalogo";

/** Producto con su texto ya normalizado, listo para buscar y comparar. */
export type ProductoIndexado = {
  producto: Producto;
  /** Palabras clave del nombre (minúsculas, sin acentos, en singular, con sinónimos y medidas unificados). */
  tokens: string[];
  /** Palabras del nombre, la marca, la subcategoría y la categoría (para saber si una búsqueda coincide exacto). */
  todas: Set<string>;
  /** Tipo de producto: la primera palabra clave del nombre ("tornillo", "cemento"). */
  tipo: string;
  /** Medidas del nombre ya unificadas ("1/4", "1-1/2", "2pulg", "42.5kg"). */
  medidas: string[];
};

export type TipoSenal = "compra" | "whatsapp" | "carrito" | "visto" | "busqueda";

/**
 * Algo que hizo el cliente y dice qué le interesa. Solo IDs de producto, términos de búsqueda y fechas:
 * nada de datos personales. `compra` queda para cuando el historial de facturas del SQL alimente el perfil.
 */
export type Senal = {
  tipo: TipoSenal;
  id?: string; // producto (todas menos "busqueda")
  termino?: string; // solo "busqueda"
  fecha: number; // milisegundos (Date.now())
};
