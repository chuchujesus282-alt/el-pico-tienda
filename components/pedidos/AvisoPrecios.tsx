import { CircleAlert, RefreshCw } from "lucide-react";
import { formatearPrecio } from "@/lib/formato";

export type CambioPrecio = { id: string; titulo: string; antes: number; ahora: number };

type Props = {
  cambios: CambioPrecio[];
  /** Nombres de los productos que se quitaron porque ya no están a la venta. */
  quitados: string[];
  /** Saint no respondió: se envía con los precios que tenía el cliente. */
  sinVerificar: boolean;
};

/**
 * Aviso de finalizar pedido (usePedidoEnCuenta lo arma; FormularioPedido lo pone junto al botón de WhatsApp): qué
 * precios cambiaron, qué se quitó del pedido y si no se pudieron confirmar los precios. Se ve ANTES de abrir WhatsApp.
 */
export default function AvisoPrecios({ cambios, quitados, sinVerificar }: Props) {
  if (cambios.length === 0 && quitados.length === 0 && !sinVerificar) return null;

  return (
    <div role="status" aria-live="polite" className="mb-3 flex flex-col gap-2 text-[13px] leading-snug motion-safe:animate-aparecer">
      {cambios.length > 0 && (
        <div className="flex gap-2 rounded-boton bg-pico-azul-claro px-3 py-2.5 text-texto">
          <RefreshCw className="mt-0.5 size-4 shrink-0 text-pico-azul" aria-hidden />
          <div>
            <p className="font-semibold text-pico-azul">
              {cambios.length === 1 ? "Actualizamos un precio:" : `Actualizamos ${cambios.length} precios:`}
            </p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {cambios.map((c) => (
                <li key={c.id}>
                  {c.titulo}: <span className="line-through">{formatearPrecio(c.antes)}</span>{" "}
                  <span className="font-semibold">{formatearPrecio(c.ahora)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-gris-texto">El total ya tiene el precio de hoy.</p>
          </div>
        </div>
      )}
      {quitados.length > 0 && (
        <div className="flex gap-2 rounded-boton bg-pico-azul-claro px-3 py-2.5 text-texto">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-pico-rojo" aria-hidden />
          <p>
            <span className="font-semibold text-pico-azul">
              {quitados.length === 1 ? "Quitamos un producto del pedido" : `Quitamos ${quitados.length} productos del pedido`}
            </span>{" "}
            porque ya no {quitados.length === 1 ? "está" : "están"} a la venta: {quitados.join(", ")}.
          </p>
        </div>
      )}
      {sinVerificar && (
        <div className="flex gap-2 rounded-boton border border-gris-borde bg-pico-blanco px-3 py-2.5 text-gris-texto">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-pico-azul" aria-hidden />
          <p>No pudimos confirmar los precios en este momento. Puedes enviar tu pedido igual: te confirmamos el total por WhatsApp.</p>
        </div>
      )}
    </div>
  );
}
