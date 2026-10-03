import type { Producto } from "./catalogo";

export type ItemCarrito = {
  producto: Producto;
  cantidad: number;
};
