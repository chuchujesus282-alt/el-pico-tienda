"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import type { Producto } from "@/types/catalogo";

const MS_AGREGADO = 1400;

export default function BotonAgregar({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), MS_AGREGADO);
    return () => clearTimeout(t);
  }, [agregado]);

  return (
    <Boton
      anchoCompleto
      onClick={() => {
        agregar(producto);
        setAgregado(true);
      }}
      aria-label={`Agregar ${producto.nombre} al carrito`}
      className={agregado ? "bg-pico-azul! hover:bg-pico-azul! motion-safe:animate-latido" : ""}
    >
      {agregado ? (
        <>
          <Check className="size-4" aria-hidden />
          ¡Agregado!
        </>
      ) : (
        <>
          <ShoppingCart
            className="size-4 transition-transform duration-300 motion-safe:group-hover/boton:-translate-x-0.5 motion-safe:group-hover/boton:-rotate-12"
            aria-hidden
          />
          Agregar
        </>
      )}
    </Boton>
  );
}
