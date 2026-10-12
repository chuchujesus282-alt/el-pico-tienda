"use client";

import { useEffect, useMemo, useState } from "react";
import { cargarIndice } from "@/components/busqueda/indiceCliente";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import CarruselProductos from "@/components/producto/CarruselProductos";
import { leerSenales } from "@/lib/recomendaciones/almacenPerfil";
import type { IndiceBusqueda } from "@/lib/recomendaciones/busqueda";
import { tePuedeInteresar } from "@/lib/recomendaciones/interesar";
import type { Senal } from "@/lib/recomendaciones/tipos";
import type { Producto } from "@/types/catalogo";

type Props = {
  /** Lo que se ve primero y lo que ve un cliente nuevo: los más vendidos (los trae el servidor). */
  inicial: Producto[];
  titulo?: string;
  className?: string;
};

/**
 * "Te puede interesar" personalizado con el perfil guardado en este navegador
 * (pedidos por WhatsApp, carrito, productos vistos y búsquedas). Sin perfil: los más vendidos.
 */
export default function TePuedeInteresar({ inicial, titulo = "Te puede interesar", className }: Props) {
  const { items } = useCarrito();
  const [perfil, setPerfil] = useState<{ indice: IndiceBusqueda; senales: Senal[] } | null>(null);

  useEffect(() => {
    const senales = leerSenales();
    if (!senales.length) return; // cliente nuevo: se quedan los más vendidos
    let vigente = true;
    cargarIndice().then((indice) => {
      if (vigente && indice) setPerfil({ indice, senales });
    });
    return () => {
      vigente = false;
    };
  }, []);

  const enCarrito = items.map((i) => i.producto.id).join(",");
  const productos = useMemo(() => {
    if (!perfil) return inicial;
    return tePuedeInteresar({
      productos: perfil.indice.productos,
      senales: perfil.senales,
      indice: perfil.indice,
      enCarrito: enCarrito ? enCarrito.split(",") : [],
      limite: 10,
    });
  }, [perfil, enCarrito, inicial]);

  return <CarruselProductos titulo={titulo} productos={productos} className={className} />;
}
