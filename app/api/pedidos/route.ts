import { after, NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { limpiarEnvioPedido } from "@/lib/pedidos/reglas";
import { guardarPedido } from "@/lib/pedidos/servidor";

// Guarda en la cuenta el pedido que el cliente acaba de enviar por WhatsApp (components/pedidos/usePedidoEnCuenta.ts
// lo manda con fetch keepalive en el mismo toque). WhatsApp ya se abrió: esto NUNCA lo frena. Responde 204 al instante
// y guarda después (after()). Sin sesión no guarda nada (de los visitantes solo quedan los eventos "pedido_enviado").

const TAMANO_MAXIMO = 64 * 1024;
const nada = () => new NextResponse(null, { status: 204 });

export async function POST(peticion: NextRequest) {
  // Solo desde la misma tienda.
  const sitio = peticion.headers.get("sec-fetch-site");
  if (sitio && sitio !== "same-origin") return nada();

  let texto: string;
  try {
    texto = await peticion.text();
  } catch {
    return nada();
  }
  if (texto.length > TAMANO_MAXIMO) return nada();

  let envio;
  try {
    envio = limpiarEnvioPedido(JSON.parse(texto));
  } catch {
    return nada();
  }
  if (!envio) return nada();

  const cabeceras = peticion.headers;
  after(async () => {
    try {
      const sesion = await auth.api.getSession({ headers: cabeceras });
      if (sesion) await guardarPedido(sesion.user.id, envio);
    } catch (error) {
      console.error("[pedidos] No se pudo guardar el pedido:", error);
    }
  });
  return nada();
}
