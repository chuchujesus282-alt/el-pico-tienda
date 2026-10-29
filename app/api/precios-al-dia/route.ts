import { leerIds } from "@/lib/busquedaServidor";
import { CODIGOS_POR_PEDIDO } from "@/lib/preciosSaint";
import { preciosAlDia } from "@/lib/saint";

// Finalizar pedido: POST /api/precios-al-dia con { ids } (los códigos del pedido, máx. 50) → el precio ACTUAL de Saint
// de cada uno (&codigos=, sin caché), para avisarle al cliente si algo cambió ANTES de abrir WhatsApp
// (components/pedidos/usePedidoEnCuenta.tsx). Lo ya preguntado hace menos de 30 s se reutiliza (lib/saint.ts), así
// Saint no recibe un pedido por cada visita. No registra eventos. Responsable: persona A.

const TAMANO_MAXIMO = 8 * 1024;
const sinCache = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  // Solo desde la misma tienda: cada llamada le pide a Saint.
  const sitio = request.headers.get("sec-fetch-site");
  if (sitio && sitio !== "same-origin") return Response.json({ error: "No permitido" }, { status: 403 });

  const texto = await request.text();
  if (texto.length > TAMANO_MAXIMO) return Response.json({ error: "Pedido demasiado grande" }, { status: 413 });
  let cuerpo: { ids?: unknown };
  try {
    cuerpo = JSON.parse(texto) ?? {};
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const { precios, retirados, sinVerificar } = await preciosAlDia(leerIds(cuerpo.ids, CODIGOS_POR_PEDIDO));
  return Response.json(
    { productos: [...precios].map(([id, precio]) => ({ id, ...precio })), retirados, sinVerificar },
    { headers: sinCache },
  );
}
