"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import Boton from "@/components/ui/Boton";
import type { Producto } from "@/types/catalogo";

const CANTIDAD_MAXIMA = 999;

/** Cantidad + "Agregar al carrito" (abre el panel del carrito) + "Comprar ahora" (va a finalizar pedido solo con este producto). */
export default function AccionesCompra({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);

  const cambiar = (valor: number) => setCantidad(Math.min(CANTIDAD_MAXIMA, Math.max(1, Math.floor(valor) || 1)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-pico-azul" id="etiqueta-cantidad">
          Cantidad
        </span>
        <div className="flex items-center rounded-boton border border-gris-borde bg-pico-blanco">
          <button
            type="button"
            onClick={() => cambiar(cantidad - 1)}
            disabled={cantidad <= 1}
            className="flex size-10 items-center justify-center text-pico-azul hover:bg-gris-fondo disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Quitar una unidad"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={CANTIDAD_MAXIMA}
            value={cantidad}
            onChange={(e) => cambiar(Number(e.target.value))}
            aria-labelledby="etiqueta-cantidad"
            className="h-10 w-12 [appearance:textfield] border-x border-gris-borde text-center text-sm font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-pico-azul [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => cambiar(cantidad + 1)}
            disabled={cantidad >= CANTIDAD_MAXIMA}
            className="flex size-10 items-center justify-center text-pico-azul hover:bg-gris-fondo disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Agregar una unidad"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
        <Boton onClick={() => agregar(producto, cantidad)} className="h-12 text-base">
          <ShoppingCart className="size-5" aria-hidden />
          Agregar al carrito
        </Boton>
        <Boton
          variante="secundario"
          href={`/finalizar-pedido?producto=${encodeURIComponent(producto.id)}&cantidad=${cantidad}`}
          className="h-12 text-base"
        >
          <ShoppingBag className="size-5" aria-hidden />
          Comprar ahora
        </Boton>
      </div>
    </div>
  );
}
