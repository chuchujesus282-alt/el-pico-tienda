import type { ItemCarrito } from "@/types/carrito";
import { formatearPrecio } from "@/lib/formato";

// Número de la tienda en formato internacional sin "+" (ver .env.example).
export const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

export function totalCarrito(items: ItemCarrito[]): number {
  return items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
}

export function armarMensajePedido(items: ItemCarrito[]): string {
  const lineas = items.map(
    ({ producto, cantidad }) =>
      `• ${cantidad} x ${producto.nombre} (Cód. ${producto.id}) — ${formatearPrecio(producto.precio * cantidad)}`,
  );
  return [
    "¡Hola, El Pico! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total referencial: ${formatearPrecio(totalCarrito(items))}`,
    "",
    "¿Me confirmas disponibilidad y forma de pago?",
  ].join("\n");
}

/** Enlace wa.me con el mensaje ya escrito. Sin número configurado, WhatsApp deja elegir el contacto. */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
