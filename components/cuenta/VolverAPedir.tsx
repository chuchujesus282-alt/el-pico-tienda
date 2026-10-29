"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, ShoppingCart } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import Boton from "@/components/ui/Boton";
import type { Producto } from "@/types/catalogo";

type Props = {
  /** Los productos del pedido con los datos de HOY (precio de hoy); los que ya no existen no vienen. */
  lineas: { producto: Producto; cantidad: number }[];
  /** Cuántos productos del pedido ya no están en el catálogo. */
  faltan: number;
};

/** "Volver a pedir": agrega los productos de un pedido al carrito, con los precios de hoy. */
export default function VolverAPedir({ lineas, faltan }: Props) {
  const { agregar } = useCarrito();
  const [listo, setListo] = useState(false);

  const volverAPedir = () => {
    for (const { producto, cantidad } of lineas) agregar(producto, cantidad);
    setListo(true);
  };

  return (
    <div className="flex flex-col gap-3">
      {lineas.length > 0 ? (
        <Boton type="button" onClick={volverAPedir} className="self-start max-sm:w-full">
          <RotateCcw className="size-5" aria-hidden />
          Volver a pedir
        </Boton>
      ) : (
        <p className="text-sm text-gris-texto">Ninguno de estos productos está disponible hoy en la tienda.</p>
      )}
      <p className="text-[13px] text-gris-texto">
        Se agregan a tu carrito con los precios de hoy.
        {faltan > 0 && ` ${faltan === 1 ? "Un producto ya no está" : `${faltan} productos ya no están`} en la tienda y no se agrega${faltan === 1 ? "" : "n"}.`}
      </p>
      {listo && (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-tarjeta bg-pico-azul-claro px-4 py-3 text-sm text-pico-azul motion-safe:animate-aparecer">
          <ShoppingCart className="size-4" aria-hidden />
          Listo: agregamos {lineas.length} {lineas.length === 1 ? "producto" : "productos"} a tu carrito.
          <Link href="/carrito" className="font-semibold underline underline-offset-4 hover:text-pico-rojo">
            Ver carrito
          </Link>
        </p>
      )}
    </div>
  );
}
