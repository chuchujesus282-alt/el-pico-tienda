import type { ComponentType } from "react";
import BannerPinturas from "./BannerPinturas";
import "./banner.css";

/**
 * Banner propio de cada categoría (escena con fotos reales a la derecha del encabezado). Las categorías sin entrada
 * siguen con el plano y su ícono. Para sumar una: su componente en esta carpeta y una línea aquí.
 */
const BANNERS: Record<string, { Escena: ComponentType; subtitulo?: string }> = {
  pinturas: { Escena: BannerPinturas, subtitulo: "Color para cada rincón" },
};

export function bannerDeCategoria(slug: string) {
  return BANNERS[slug];
}
