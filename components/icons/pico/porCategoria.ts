import { createElement } from "react";
import type { ComponenteIcono } from "@/types/icono";
import IconoBloques from "./IconoBloques";
import IconoBombillo from "./IconoBombillo";
import IconoCandado from "./IconoCandado";
import IconoCasco from "./IconoCasco";
import IconoEscudo from "./IconoEscudo";
import IconoLlanta from "./IconoLlanta";
import IconoManto from "./IconoManto";
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
  griferia: IconoTuberia,
  pinturas: IconoRodillo,
  "hogar-y-jardin": IconoPala,
  "seguridad-industrial": IconoCasco,
  vehiculos: IconoLlanta,
};

export function iconoDeCategoria(slug: string): ComponenteIcono {
  return POR_CATEGORIA[slug] ?? IconoTornillo;
}

/**
 * Subcategorías de Saint con un ícono más preciso que el de su categoría (por el nombre, sin acentos y en minúsculas).
 * Las que no están aquí usan el de su categoría. Ojo con el orden: gana la primera que coincide.
 */
const POR_SUBCATEGORIA: [RegExp, ComponenteIcono][] = [
  // Herramientas
  [/medicion/, IconoRegla],
  [/automotri|vehicul/, IconoLlanta],
  [/oxicorte|soldadura/, IconoRayo],
  [/hidraulic/, IconoTuberia],
  // Construcción
  [/grupo quimico/, IconoManto],
  [/manguera/, IconoTuberia],
  // Electricidad ("Protección" sola; las de Seguridad industrial dicen "Protección de…" y siguen con el casco)
  [/^proteccion$/, IconoEscudo],
  [/cableado|dispositivos de conexion|control de motores/, IconoRayo],
  [/iluminacion|instalacion y montaje/, IconoBombillo],
  // Vehículos
  [/sistema electric/, IconoRayo],
  // Seguridad industrial
  [/proteccion contra incendios|senalizacion/, IconoEscudo],
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
