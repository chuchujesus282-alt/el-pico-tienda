import { getIndiceProductos } from "@/lib/catalogo";

// Entrega el catálogo al navegador para las sugerencias en vivo del buscador y "Te puede interesar".
// Pasa por lib/catalogo.ts (la URL y el token de la API nunca llegan al navegador) y se guarda 5 minutos.

export const revalidate = 300;

export async function GET() {
  try {
    return Response.json(await getIndiceProductos());
  } catch {
    // Sin catálogo: el buscador sigue funcionando con la página /buscar.
    return Response.json([], { status: 503 });
  }
}
