import { indiceSiEstaListo } from "@/lib/indiceServidor";
import { leerIds, leerSenales, MAXIMO_EN_CARRITO, responderInteresar } from "@/lib/busquedaServidor";

// "Te puede interesar" personalizado: POST /api/te-puede-interesar con { senales, enCarrito } (lo que el cliente miró
// en su navegador y los códigos de su carrito) → { productos: Producto[] | null, listo }. Con `productos: null` (el
// índice se está armando) el navegador se queda con los más vendidos. No registra eventos para análisis.

/** Un perfil de 50 señales pesa unos pocos KB; más que esto no es un pedido de la tienda. */
const TAMANO_MAXIMO = 32 * 1024;

export async function POST(request: Request) {
  const texto = await request.text();
  if (texto.length > TAMANO_MAXIMO) return Response.json({ error: "Pedido demasiado grande" }, { status: 413 });
  let cuerpo: { senales?: unknown; enCarrito?: unknown };
  try {
    cuerpo = JSON.parse(texto) ?? {};
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const productos = responderInteresar(
    indiceSiEstaListo()?.indice ?? null,
    leerSenales(cuerpo.senales),
    leerIds(cuerpo.enCarrito, MAXIMO_EN_CARRITO),
  );
  // Personal de cada cliente: nunca se guarda en una caché compartida.
  return Response.json({ productos, listo: productos !== null }, { headers: { "Cache-Control": "no-store" } });
}
