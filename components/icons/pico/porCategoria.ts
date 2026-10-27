import { createElement } from "react";
import type { ComponenteIcono } from "@/types/icono";
import IconoBloques from "./IconoBloques";
import IconoBombillo from "./IconoBombillo";
import IconoCandado from "./IconoCandado";
import IconoCasco from "./IconoCasco";
import IconoLlanta from "./IconoLlanta";
import IconoPala from "./IconoPala";
import IconoRayo from "./IconoRayo";
import IconoRegla from "./IconoRegla";
import IconoRodillo from "./IconoRodillo";
import IconoTaladro from "./IconoTaladro";
import IconoTornillo from "./IconoTornillo";
import IconoTuberia from "./IconoTuberia";

/** Ícono propio de cada categoría (por su slug), para su encabezado. Una categoría nueva cae en el tornillo. */
const POR_CATEGORIA: Record<string, ComponenteIcono> = {
  herramientas: IconoTaladro,
  construccion: IconoBloques,
  tornilleria: IconoTornillo,
  cerrajeria: IconoCandado,
  electricidad: IconoBombillo,
  plomeria: IconoTuberia,
  pinturas: IconoRodillo,
  "hogar-y-jardin": IconoPala,
  "seguridad-industrial": IconoCasco,
  vehiculos: IconoLlanta,
};

export function iconoDeCategoria(slug: string): ComponenteIcono {
  return POR_CATEGORIA[slug] ?? IconoTornillo;
}

/** Subcategorías con un ícono más preciso que el de su categoría (por palabra del nombre, sin acentos). */
const POR_SUBCATEGORIA: [RegExp, ComponenteIcono][] = [
  [/medicion/, IconoRegla],
  [/automotri|vehicul/, IconoLlanta],
  [/oxicorte|soldadura/, IconoRayo],
  [/hidraulic/, IconoTuberia],
];

/** Ícono para un producto sin foto: el de su subcategoría si hay uno, si no el de su categoría. */
export function iconoDeProducto(categoria: string, subcategoria?: string | null): ComponenteIcono {
  const nombre = (subcategoria ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return POR_SUBCATEGORIA.find(([patron]) => patron.test(nombre))?.[1] ?? iconoDeCategoria(categoria);
}

/** <IconoDeProducto categoria subcategoria className />: el ícono de iconoDeProducto() ya dibujado. */
export function IconoDeProducto({
  categoria,
  subcategoria,
  className,
}: {
  categoria: string;
  subcategoria?: string | null;
  className?: string;
}) {
  return createElement(iconoDeProducto(categoria, subcategoria), { className });
}
