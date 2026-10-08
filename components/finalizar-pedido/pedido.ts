import { formatearPrecio } from "@/lib/formato";
import { totalCarrito } from "@/lib/whatsapp";
import type { ItemCarrito } from "@/types/carrito";
import type { Direccion } from "@/types/cliente";

export type FormaRetiro = "pickup" | "delivery" | "flete";
export type MetodoPago = "divisas" | "pago-movil" | "transferencia" | "cashea" | "zelle" | "usdt" | "combinado";

export const FORMAS_RETIRO: { valor: FormaRetiro; etiqueta: string; detalle: string }[] = [
  { valor: "pickup", etiqueta: "Pick-up", detalle: "Lo retiras en la tienda." },
  { valor: "delivery", etiqueta: "Delivery", detalle: "Te lo llevamos a tu dirección." },
  { valor: "flete", etiqueta: "Flete", detalle: "Para pedidos grandes o materiales pesados." },
];

export const METODOS_PAGO: { valor: MetodoPago; etiqueta: string }[] = [
  { valor: "divisas", etiqueta: "Divisas" },
  { valor: "pago-movil", etiqueta: "Pago móvil" },
  { valor: "transferencia", etiqueta: "Transferencia bancaria" },
  { valor: "cashea", etiqueta: "Cashea" },
  { valor: "zelle", etiqueta: "Zelle" },
  { valor: "usdt", etiqueta: "USDT" },
  { valor: "combinado", etiqueta: "Pago combinado" },
];

/** Métodos que se pueden marcar dentro de "Pago combinado" (todos menos el propio combinado). */
export const METODOS_COMBINABLES = METODOS_PAGO.filter((m) => m.valor !== "combinado");

export type DatosPedido = {
  items: ItemCarrito[];
  retiro: FormaRetiro;
  direccion: Direccion | null;
  pago: MetodoPago;
  combinados: MetodoPago[];
};

const etiquetaPago = (valor: MetodoPago) => METODOS_PAGO.find((m) => m.valor === valor)?.etiqueta ?? valor;

export function textoDireccion(d: Direccion): string {
  return `${d.alias}: ${d.direccion}, ${d.zona}${d.referencia ? ` (Ref.: ${d.referencia})` : ""}`;
}

/** Mensaje de WhatsApp con productos, forma de retiro (y dirección si aplica) y método de pago. */
export function armarMensajeFinal({ items, retiro, direccion, pago, combinados }: DatosPedido): string {
  const lineas = items.map(
    ({ producto, cantidad }) =>
      `• ${cantidad} x ${producto.nombre} (Cód. ${producto.id}) — ${formatearPrecio(producto.precio * cantidad)}`,
  );

  const entrega =
    retiro === "pickup"
      ? ["Retiro: Pick-up en la tienda"]
      : [`Retiro: ${retiro === "delivery" ? "Delivery" : "Flete"}`, `Dirección: ${direccion ? textoDireccion(direccion) : "por confirmar"}`];

  const metodo =
    pago === "combinado"
      ? `Pago combinado (${combinados.map(etiquetaPago).join(" + ")})`
      : etiquetaPago(pago);

  return [
    "¡Hola, El Pico! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total referencial: ${formatearPrecio(totalCarrito(items))}`,
    "",
    ...entrega,
    `Método de pago: ${metodo}`,
    "",
    "¿Me confirmas disponibilidad y el total final?",
  ].join("\n");
}
