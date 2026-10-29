import IconoCasco from "@/components/icons/pico/IconoCasco";
import IconoTornillo from "@/components/icons/pico/IconoTornillo";
import type { ComponenteIcono } from "@/types/icono";
import type { Banner, Producto } from "@/types/catalogo";

// Contenido editable de la página principal: banners, asesoría, logos de marcas y
// secciones por categoría. Mientras no haya imágenes en public/banners/ y public/marcas/,
// se muestran versiones hechas con los colores de marca; al poner `imagen`/`logo`, se usa la imagen.

export type VarianteBanner = "azul" | "oscuro" | "claro";

export type BannerInicio = Omit<Banner, "imagen"> & {
  imagen: string | null; // ruta en public/banners/ o URL absoluta
  titulo: string;
  texto?: string;
  textoBoton?: string;
  variante?: VarianteBanner;
  icono?: ComponenteIcono;
  /**
   * Título en dos tiempos (solo carrusel principal): la frase y la palabra clave, que va enorme sobre un bloque
   * rojo. Debe decir lo mismo que `titulo`, que se sigue usando como nombre del banner.
   */
  tituloPartes?: [string, string];
};

export type Marca = {
  nombre: string;
  logo: string | null; // ruta en public/marcas/
};

export type SeccionCategoriaInicio = {
  slug: string;
  /** Banner de la categoría. Sin imagen (ni de la API) no se muestra: el título del carrusel basta. */
  imagen: string | null;
};

/**
 * Datos de las variantes PROPIAS del carrusel central (por slug de la categoría). Qué categoría va en cada lugar cada
 * día lo dice lib/rotacionBanners.ts; el registro de diseños, bannersPorCategoria.tsx. Las escenas de herramientas y
 * pinturas se montan por `id` en BannerInicio: no cambies esos ids.
 */
export const bannersCentrales: Record<string, BannerInicio> = {
  construccion: {
    id: "obra",
    imagen: null,
    alt: "Materiales de construcción en El Pico",
    href: "/categoria/construccion",
    titulo: "Materiales para construir",
    texto: "Cemento, bloques, pegos y más para construir sin paradas.",
    textoBoton: "Ver materiales",
    variante: "azul",
    // Provisional a propósito: solo el texto sobre el azul, sin escena ni ícono (la escena se quitó el 2026-10-23).
  },
  herramientas: {
    id: "herramientas",
    imagen: null,
    alt: "Herramientas en El Pico",
    href: "/categoria/herramientas",
    titulo: "Herramientas que rinden",
    tituloPartes: ["Herramientas que", "rinden"],
    texto: "Taladros, esmeriles y herramientas manuales para cada trabajo.",
    textoBoton: "Ver herramientas",
    variante: "oscuro",
    // Sin ícono: en su lugar flota un rotomartillo real (HerramientasAsomadas).
  },
  pinturas: {
    id: "pinturas",
    imagen: null,
    alt: "Pinturas en El Pico",
    href: "/categoria/pinturas",
    titulo: "Renueva tus espacios",
    tituloPartes: ["Renueva tus", "espacios"],
    texto: "Pinturas, rodillos y brochas para darle color a tu casa.",
    textoBoton: "Ver pinturas",
    // Todo el banner es la pared pintada del color de turno; un rodillo la repinta (PinturaEnMovimiento).
    variante: "oscuro",
  },
  cerrajeria: {
    id: "cerrajeria",
    imagen: null,
    alt: "Cerrajería en El Pico",
    href: "/categoria/cerrajeria",
    titulo: "Cerrajería que protege",
    texto: "Candados, cerraduras, cilindros y bisagras para tu casa o tu negocio.",
    textoBoton: "Ver cerrajería",
    variante: "azul",
    // Provisional a propósito: solo el texto sobre el azul, sin escena ni ícono.
  },
};

/** Mensaje con el que se abre WhatsApp desde "¿No sabes qué necesitas?". */
export const mensajeAsesoria = "¡Hola, El Pico! Necesito asesoría para saber qué comprar.";

/** Datos de las variantes PROPIAS de los banners horizontales (por slug de la categoría). */
export const bannersHorizontales: Record<string, BannerInicio> = {
  "seguridad-industrial": {
    id: "seguridad",
    imagen: null,
    alt: "Seguridad industrial en El Pico",
    href: "/categoria/seguridad-industrial",
    // Se muestra con BannerTrabajaProtegido (el casco al que le caen cosas). El título es el nombre de la categoría.
    titulo: "Seguridad industrial",
    texto: "Cascos, guantes, botas y mascarillas.",
    textoBoton: "Ver seguridad",
    variante: "azul",
    icono: IconoCasco,
  },
  tornilleria: {
    id: "tornilleria",
    imagen: null,
    alt: "Tornillería en El Pico",
    href: "/categoria/tornilleria",
    titulo: "Tornillería",
    texto: "Tornillos, tuercas, anclajes y fijaciones.",
    textoBoton: "Ver tornillería",
    variante: "claro",
    icono: IconoTornillo,
  },
};

/** Logos por nombre de marca (tal como viene del sistema). Ej.: { AQUAFLEX: "/marcas/aquaflex.png" } */
export const logosMarcas: Record<string, string> = {};

/** Marcas reales de los productos mostrados (no una lista fija), ordenadas alfabéticamente. */
export function marcasDeProductos(productos: Producto[], limite = 12): Marca[] {
  const nombres = [...new Set(productos.map((p) => p.marca).filter((m): m is string => !!m))];
  return nombres
    .sort((a, b) => a.localeCompare(b, "es"))
    .slice(0, limite)
    .map((nombre) => ({ nombre, logo: logosMarcas[nombre] ?? null }));
}

/**
 * Texto corto y botón de cada categoría: los usan las columnas verticales (descripción de las tarjetas animadas y de
 * `ColumnaCategoria`) y los banners GENÉRICOS de cualquier formato (bannersPorCategoria.tsx), con el nombre de la
 * categoría como título. Son los mismos textos que ya tenían sus banners. `imagenColumna`: foto vertical (3:4,
 * idealmente 900×1200) en public/categorias/ para la columna genérica; sin foto, el plano técnico de su ícono.
 */
export const textosCategoria: Record<string, { texto: string; textoBoton: string; imagenColumna?: string | null }> = {
  herramientas: { texto: "Taladros, esmeriles y herramientas manuales para cada trabajo.", textoBoton: "Ver herramientas" },
  construccion: { texto: "Cemento, bloques, pegos y más para construir sin paradas.", textoBoton: "Ver materiales" },
  tornilleria: { texto: "Tornillos, tuercas, anclajes y fijaciones.", textoBoton: "Ver tornillería" },
  cerrajeria: { texto: "Candados, cerraduras, cilindros y bisagras para tu casa o tu negocio.", textoBoton: "Ver cerrajería" },
  electricidad: { texto: "Cables, breakers, tomas e iluminación.", textoBoton: "Ver electricidad" },
  griferia: { texto: "Grifos, duchas, llaves, sanitarios, repuestos, desagües y filtros.", textoBoton: "Ver grifería" },
  pinturas: { texto: "Pinturas, rodillos y brochas para darle color a tu casa.", textoBoton: "Ver pinturas" },
  "hogar-y-jardin": { texto: "Mangueras, herramientas de jardín y más para tu casa.", textoBoton: "Ver hogar y jardín" },
  "seguridad-industrial": { texto: "Cascos, guantes, botas y mascarillas.", textoBoton: "Ver seguridad" },
  vehiculos: { texto: "Aceites, lubricantes y accesorios para tu carro.", textoBoton: "Ver vehículos" },
};

export const seccionesCategoria: SeccionCategoriaInicio[] = [
  { slug: "construccion", imagen: null },
  { slug: "hogar-y-jardin", imagen: null },
];
