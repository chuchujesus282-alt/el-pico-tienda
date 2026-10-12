import type { Producto } from "@/types/catalogo";
import { crearIndice } from "@/lib/recomendaciones/busqueda";
import type { IndiceBusqueda } from "@/lib/recomendaciones/busqueda";

// Catálogo e índice de búsqueda en el navegador. Se piden una sola vez (la primera vez que el cliente
// toca el buscador o que "Te puede interesar" lo necesita) y se comparten entre componentes.

let pedido: Promise<Producto[]> | null = null;

export function cargarProductos(): Promise<Producto[]> {
  pedido ??= fetch("/api/indice-busqueda")
    .then((r) => (r.ok ? (r.json() as Promise<Producto[]>) : []))
    .catch(() => [])
    .then((productos) => {
      if (!productos.length) pedido = null; // si falló, se reintenta la próxima vez
      return productos;
    });
  return pedido;
}

export async function cargarIndice(): Promise<IndiceBusqueda | null> {
  const productos = await cargarProductos();
  return productos.length ? crearIndice(productos) : null;
}
