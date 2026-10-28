import { getIndiceConEstado } from "@/lib/catalogo";
import { elegirFavoritos, leerIds, MAXIMO_FAVORITOS } from "@/lib/busquedaServidor";

// Página de Favoritos: POST /api/favoritos con { ids } (los códigos guardados, máx. 200) → { productos, completo }.
// Devuelve solo esos productos, con el precio de hoy (antes el navegador descargaba el catálogo entero). Con
// `completo: false` faltó una parte del catálogo: lo que no llegó no es que ya no exista. No usa el índice de búsqueda
// (no hace falta para esto) ni registra eventos para análisis.

const TAMANO_MAXIMO = 32 * 1024;

export async function POST(request: Request) {
  const texto = await request.text();
  if (texto.length > TAMANO_MAXIMO) return Response.json({ error: "Pedido demasiado grande" }, { status: 413 });
  let cuerpo: { ids?: unknown };
  try {
    cuerpo = JSON.parse(texto) ?? {};
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const sinCache = { "Cache-Control": "no-store" };
  try {
    const { productos, completo } = await getIndiceConEstado();
    return Response.json({ productos: elegirFavoritos(productos, leerIds(cuerpo.ids, MAXIMO_FAVORITOS)), completo }, { headers: sinCache });
  } catch {
    // Sin catálogo: la página lo dice ("No pudimos conectar con el catálogo…").
    return Response.json({ productos: [], completo: false }, { status: 503, headers: sinCache });
  }
}
