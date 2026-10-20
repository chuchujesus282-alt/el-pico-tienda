import type { ComponentType } from "react";
import BannerConstruccion from "./BannerConstruccion";
import BannerHerramientas from "./BannerHerramientas";
import BannerPinturas from "./BannerPinturas";
import "./banner.css";

type ConfigBanner = {
  Escena: ComponentType;
  /** Frase + palabra clave sobre el sello rojo (como "Herramientas que RINDEN" del inicio). */
  tituloPartes: [string, string];
  /** Una línea bajo el título. */
  texto: string;
};

/**
 * Banner propio de cada categoría (escena con fotos reales a la derecha del encabezado). Las categorías sin entrada
 * siguen con el plano y su ícono. Para sumar una: su componente en esta carpeta y una línea aquí.
 */
const BANNERS: Record<string, ConfigBanner> = {
  pinturas: {
    Escena: BannerPinturas,
    tituloPartes: ["Dale color con", "Pinturas"],
    texto: "Pinturas, brochas, rodillos y todo para pintar como un profesional.",
  },
  construccion: {
    Escena: BannerConstruccion,
    tituloPartes: ["Materiales de", "Construcción"],
    texto: "Cemento, bloques, cabillas y todo lo que tu obra necesita.",
  },
  herramientas: {
    Escena: BannerHerramientas,
    tituloPartes: ["Herramientas para", "tu taller"],
    texto: "Taladros, esmeriles, martillos y todo para cada trabajo.",
  },
};

export function bannerDeCategoria(slug: string) {
  return BANNERS[slug];
}
