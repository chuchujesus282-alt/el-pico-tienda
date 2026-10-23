import type { ComponentType } from "react";
import BannerConstruccion from "./BannerConstruccion";
import BannerHerramientas from "./BannerHerramientas";
import BannerJardin from "./BannerJardin";
import BannerPinturas from "./BannerPinturas";
import "./banner.css";

/** Props de un banner que reemplaza al encabezado entero (ej. BannerPinturas, sobre components/categoria/banner-plano/). */
export type PropsBannerPropio = {
  /** Nombre de la categoría: es el título del banner. */
  nombre: string;
  texto: string;
  kicker: string;
};

type ConfigBanner = {
  /** Escena dentro de EncabezadoPagina (banners con fotos). */
  Escena?: ComponentType;
  /** Banner "plano técnico" que reemplaza a EncabezadoPagina entero (ruta y h1 incluidos). */
  Propio?: ComponentType<PropsBannerPropio>;
  /** Texto chico en mono sobre el título (solo banners propios). */
  kicker?: string;
  /** Frase + palabra clave sobre el sello rojo (solo banners con Escena; los propios muestran el nombre). */
  tituloPartes?: [string, string];
  /** Una línea bajo el título. */
  texto: string;
};

/**
 * Banner propio de cada categoría: `Propio` (estilo plano técnico, reemplaza al encabezado; hoy Pinturas y Construcción) o `Escena`
 * (fotos reales a la derecha de EncabezadoPagina). Las categorías sin entrada
 * siguen con el plano y su ícono. Para sumar una: su componente en esta carpeta y una línea aquí.
 */
const BANNERS: Record<string, ConfigBanner> = {
  pinturas: {
    Propio: BannerPinturas,
    kicker: "LÁMINA 06 · ACABADOS",
    texto: "Pinturas, brochas, rodillos y todo para pintar como un profesional.",
  },
  construccion: {
    Propio: BannerConstruccion,
    kicker: "LÁMINA 02 · OBRA GRIS",
    texto: "Cemento, bloques, cabillas y todo lo que tu obra necesita.",
  },
  herramientas: {
    Escena: BannerHerramientas,
    tituloPartes: ["Herramientas para", "tu taller"],
    texto: "Taladros, esmeriles, martillos y todo para cada trabajo.",
  },
  "hogar-y-jardin": {
    Escena: BannerJardin,
    tituloPartes: ["Hogar y", "jardín"],
    texto: "Mangueras, palas, materos y todo para tu casa y tu jardín.",
  },
};

export function bannerDeCategoria(slug: string) {
  return BANNERS[slug];
}
