import { getIndiceProductos } from "@/lib/catalogo";
import type { Producto } from "@/types/catalogo";

// Entrega el catálogo al navegador para las sugerencias en vivo del buscador y "Te puede interesar".
// Pasa por lib/catalogo.ts (la URL y el token de la API nunca llegan al navegador) y se guarda 5 minutos.

export const revalidate = 300;

/**
 * Solo los campos que usan el buscador, "Te puede interesar" y favoritos (ProductCard). La descripción, cuando la
 * base de datos la traiga, NO viaja: con miles de productos haría la descarga varias veces más pesada.
 */
function paraNavegador({ id, nombre, marca, precio, imagen, categoriaSlug, subcategoria, ventas }: Producto): Producto {
  return { id, nombre, marca, precio, imagen, categoriaSlug, subcategoria, ventas };
}

export async function GET() {
  try {
    return Response.json((await getIndiceProductos()).map(paraNavegador));
  } catch {
    // Sin catálogo: el buscador sigue funcionando con la página /buscar.
    return Response.json([], { status: 503 });
  }
}
