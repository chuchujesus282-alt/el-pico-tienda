import type { Producto } from "@/types/catalogo";
import datos from "./muestraSaint.json";

// Muestra FIJA de productos REALES de Saint (366, del 2026-10-28) para las pruebas: martillos, taladros, tornillos,
// ramplugs, mechas, cemento, pinturas, brochas, rodillos, cintas… y unos pocos de cada subcategoría. Mismos campos que
// arma lib/saint.ts (nombre de Saint, titulo legible, marca, precio en $, categoría y subcategoría). Ya no hay productos
// de ejemplo en el proyecto: si una prueba necesita otro producto, se agrega aquí uno real.
export const muestraSaint = datos as Producto[];
