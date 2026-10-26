import type { ComponentType } from "react";
import BannerConstruccion from "./BannerConstruccion";
import BannerElectricidad from "./BannerElectricidad";
import BannerHerramientas from "./BannerHerramientas";
import BannerHogarJardin from "./BannerHogarJardin";
import BannerPinturas from "./BannerPinturas";
import BannerSeguridad from "./BannerSeguridad";
import BannerVehiculos from "./BannerVehiculos";
import "./banner.css";

/** Props de un banner que reemplaza al encabezado entero (ej. BannerPinturas, sobre components/categoria/banner-plano/). */
export type PropsBannerPropio = {
  /** Nombre de la categoría: es el título del banner. */
  nombre: string;
};

type ConfigBanner = {
  /** Escena dentro de EncabezadoPagina (banners con fotos). */
  Escena?: ComponentType;
  /** Banner "plano técnico" que reemplaza a EncabezadoPagina entero (ruta y h1 incluidos). */
  Propio?: ComponentType<PropsBannerPropio>;
  /** Frase + palabra clave sobre el sello rojo (solo banners con Escena; los propios muestran el nombre). */
  tituloPartes?: [string, string];
  /** Una línea bajo el título (solo banners con Escena; los propios muestran solo el nombre). */
  texto?: string;
};

/**
 * Banner propio de cada categoría: `Propio` (estilo plano técnico, reemplaza al encabezado; hoy Pinturas, Construcción, Electricidad, Hogar y jardín, Seguridad industrial y Vehículos) o `Escena`
 * (fotos reales a la derecha de EncabezadoPagina). Las categorías sin entrada
 * siguen con el plano y su ícono. Para sumar una: su componente en esta carpeta y una línea aquí.
 */
const BANNERS: Record<string, ConfigBanner> = {
  pinturas: {
    Propio: BannerPinturas,
  },
  construccion: {
    Propio: BannerConstruccion,
  },
  electricidad: {
    Propio: BannerElectricidad,
  },
  herramientas: {
    Escena: BannerHerramientas,
    tituloPartes: ["Herramientas para", "tu taller"],
    texto: "Taladros, esmeriles, martillos y todo para cada trabajo.",
  },
  "hogar-y-jardin": {
    Propio: BannerHogarJardin,
  },
  "seguridad-industrial": {
    Propio: BannerSeguridad,
  },
  vehiculos: {
    Propio: BannerVehiculos,
  },
};

export function bannerDeCategoria(slug: string) {
  return BANNERS[slug];
}
