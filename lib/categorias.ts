import type { Categoria } from "@/types/catalogo";

// Las categorías de la tienda, en el orden del menú. Cada una trae sus productos de Saint (código en
// lib/categoriasSaint.ts). Para sumar una: una línea aquí y su código en ese mapa. Responsable: persona A.
// "Grifería" se llamaba "Plomería" hasta el 2026-10-28: /categoria/plomeria redirige a /categoria/griferia
// (next.config.ts).

export const categorias: Categoria[] = [
  { slug: "herramientas", nombre: "Herramientas", banner: null },
  { slug: "construccion", nombre: "Construcción", banner: null },
  { slug: "tornilleria", nombre: "Tornillería", banner: null },
  { slug: "cerrajeria", nombre: "Cerrajería", banner: null },
  { slug: "electricidad", nombre: "Electricidad", banner: null },
  { slug: "griferia", nombre: "Grifería", banner: null },
  { slug: "pinturas", nombre: "Pinturas", banner: null },
  { slug: "hogar-y-jardin", nombre: "Hogar y jardín", banner: null },
  { slug: "seguridad-industrial", nombre: "Seguridad industrial", banner: null },
  { slug: "vehiculos", nombre: "Vehículos", banner: null },
];
