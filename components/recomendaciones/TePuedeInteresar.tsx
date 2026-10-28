"use client";

import { useEffect, useState } from "react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import CarruselProductos from "@/components/producto/CarruselProductos";
import { leerSenales } from "@/lib/recomendaciones/almacenPerfil";
import type { Producto } from "@/types/catalogo";

/** Solo las señales más recientes viajan al servidor (las viejas casi no pesan en el puntaje). */
const MAXIMO_SENALES = 50;

type Props = {
  /** Lo que se ve primero y lo que ve un cliente nuevo: los más vendidos (los trae el servidor). */
  inicial: Producto[];
  titulo?: string;
  className?: string;
};

/**
 * "Te puede interesar" personalizado con el perfil guardado en este navegador (pedidos por WhatsApp, carrito,
 * productos vistos y búsquedas). El puntaje lo calcula el servidor (POST /api/te-puede-interesar, con el índice de
 * lib/indiceServidor.ts): el navegador manda lo que el cliente miró y lo que tiene en el carrito, y recibe los 10
 * productos. Sin perfil, mientras responde o si el índice todavía se está armando: los más vendidos.
 */
export default function TePuedeInteresar({ inicial, titulo = "Te puede interesar", className }: Props) {
  const { items } = useCarrito();
  const [personales, setPersonales] = useState<Producto[] | null>(null);

  const enCarrito = items.map((i) => i.producto.id).join(",");
  useEffect(() => {
    const senales = leerSenales().slice(-MAXIMO_SENALES);
    if (!senales.length) return; // cliente nuevo: se quedan los más vendidos
    const control = new AbortController();
    fetch("/api/te-puede-interesar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senales, enCarrito: enCarrito ? enCarrito.split(",") : [] }),
      signal: control.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ productos: Producto[] | null }>) : null))
      .then((datos) => {
        if (datos?.productos?.length) setPersonales(datos.productos);
      })
      .catch(() => {
        // Sin respuesta: se quedan los más vendidos.
      });
    return () => control.abort();
  }, [enCarrito]);

  return <CarruselProductos titulo={titulo} productos={personales ?? inicial} className={className} />;
}
