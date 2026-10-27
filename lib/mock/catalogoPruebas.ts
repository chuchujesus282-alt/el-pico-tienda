import type { Producto } from "@/types/catalogo";
import { productosMock } from "./productos";

// Catálogo de PRUEBA para los tests (búsqueda, recomendaciones, calculadoras): los productos de ejemplo del sitio más
// las herramientas de ejemplo que se quitaron cuando Herramientas pasó a Saint (lib/categoriasSaint.ts). El sitio no
// usa este archivo. Mismas filas e imágenes que antes (public/productos/{id}.webp).

type FilaMock = [id: string, nombre: string, marca: string | null, precio: number, subcategoria: string | null, ventas: number];

const filas: FilaMock[] = [
  ["00302011", "TALADRO PERCUTOR 1/2\" 650W", "PROTEK", 68.5, "Eléctricas", 34],
  ["00302045", "MARTILLO UÑA 16OZ MANGO FIBRA", "FORJAMAX", 9.2, "Manuales", 76],
  ["00302088", "JUEGO DE DESTORNILLADORES 6 PIEZAS", "FORJAMAX", 12.4, "Manuales", 49],
  ["00302130", 'ESMERIL ANGULAR 4 1/2" 820W', "PROTEK", 54.99, "Eléctricas", 27],
  ["00302177", "CINTA METRICA 5MTS X 19MM", "MEDIPRO", 5.6, "Medición", 95],
  ["00302204", 'BROCA PARA CONCRETO 3/8" X 6"', "PROTEK", 2.8, "Brocas", 160],
  ["00302228", 'BROCA PARA CONCRETO 1/4" X 4"', "PROTEK", 1.95, "Brocas", 210],
  ["00302252", 'BROCA PARA METAL HSS 3/8"', "FORJAMAX", 3.6, "Brocas", 72],
  ["00302276", 'DESTORNILLADOR DE PALA 1/4" X 4"', "FORJAMAX", 2.4, "Manuales", 110],
  ["00302290", 'LLAVE AJUSTABLE 10" CROMADA', "FORJAMAX", 8.75, "Manuales", 66],
  ["00302314", 'ARCO DE SEGUETA 12" CON HOJA', "FORJAMAX", 6.2, "Manuales", 41],
  // Materiales de las calculadoras de proyectos (precios de prueba, referenciales del mercado venezolano).
  ["00302338", 'NIVEL DE ALUMINIO 24"', "MEDIPRO", 9.4, "Medición", 44],
  ["00302354", 'ESPATULA DE ACERO 4" MANGO MADERA', "FORJAMAX", 3.1, "Manuales", 61],
];

const herramientasEjemplo: Producto[] = filas.map(([id, nombre, marca, precio, subcategoria, ventas]) => ({
  id,
  nombre,
  marca,
  precio,
  imagen: `/productos/${id}.webp`,
  categoriaSlug: "herramientas",
  subcategoria,
  ventas,
}));

// En el mismo lugar que tenían antes (después de plomería), por si algún test depende del orden.
const finPlomeria = productosMock.findIndex((p) => p.categoriaSlug !== "plomeria");
export const catalogoPruebas: Producto[] = [
  ...productosMock.slice(0, finPlomeria),
  ...herramientasEjemplo,
  ...productosMock.slice(finPlomeria),
];
