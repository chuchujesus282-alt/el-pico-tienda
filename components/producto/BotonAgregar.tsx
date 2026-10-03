"use client";

import { ShoppingCart } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import type { Producto } from "@/types/catalogo";

export default function BotonAgregar({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  return (
    <Boton anchoCompleto onClick={() => agregar(producto)} aria-label={`Agregar ${producto.nombre} al carrito`}>
      <ShoppingCart className="size-4" aria-hidden />
      Agregar
    </Boton>
  );
}
