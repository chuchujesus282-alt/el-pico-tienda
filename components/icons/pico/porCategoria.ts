import type { ComponenteIcono } from "@/types/icono";
import IconoBloques from "./IconoBloques";
import IconoBombillo from "./IconoBombillo";
import IconoCandado from "./IconoCandado";
import IconoCasco from "./IconoCasco";
import IconoLlanta from "./IconoLlanta";
import IconoPala from "./IconoPala";
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
