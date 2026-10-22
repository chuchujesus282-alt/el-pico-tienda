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

export const bannersPrincipales: BannerInicio[] = [
  {
    id: "obra",
    imagen: null,
    alt: "Materiales de construcción en El Pico",
    href: "/categoria/construccion",
    titulo: "Materiales para construir",
    tituloPartes: ["Materiales para", "construir"],
    texto: "Cemento, bloques, pegos y más para construir sin paradas.",
    textoBoton: "Ver materiales",
    variante: "azul",
    // Sin ícono: en su lugar flota la paleta de bloques real sobre concreto (ObraEnConcreto).
  },
  {
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
  {
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
];

/** Mensaje con el que se abre WhatsApp desde "¿No sabes qué necesitas?". */
export const mensajeAsesoria = "¡Hola, El Pico! Necesito asesoría para saber qué comprar.";

export const bannersPromocionales: BannerInicio[] = [
  {
    id: "seguridad",
    imagen: null,
    alt: "Seguridad industrial en El Pico",
    href: "/categoria/seguridad-industrial",
    // Se muestra con BannerTrabajaProtegido (el casco al que le caen cosas): el título juega con esa animación.
    titulo: "Que nada te caiga encima",
    texto: "Cascos, guantes, botas y mascarillas para trabajar seguro, golpe tras golpe.",
    textoBoton: "Equípate",
    variante: "azul",
    icono: IconoCasco,
  },
  {
    id: "tornilleria",
    imagen: null,
    alt: "Tornillería en El Pico",
    href: "/categoria/ferreteria",
    titulo: "Tornillería de todas las medidas",
    texto: "Tornillos, tuercas, anclajes y fijaciones.",
    textoBoton: "Ver tornillería",
    variante: "claro",
    icono: IconoTornillo,
  },
];

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
 * Columnas de "Más categorías" (las categorías que no tienen banner salen solas, en el orden del catálogo). Aquí
 * solo se les pone foto y texto corto. Foto: vertical (3:4, idealmente 900×1200) en public/categorias/; sin foto
 * se ve el plano técnico del ícono de la categoría.
 */
export const columnasCategorias: Record<string, { imagen: string | null; texto?: string }> = {
  electricidad: { imagen: null, texto: "Cables, breakers, tomas e iluminación." },
  plomeria: { imagen: null, texto: "Tuberías, conexiones, llaves y grifería." },
  "hogar-y-jardin": { imagen: null, texto: "Mangueras, herramientas de jardín y más para tu casa." },
  vehiculos: { imagen: null, texto: "Aceites, lubricantes y accesorios para tu carro." },
};

export const seccionesCategoria: SeccionCategoriaInicio[] = [
  { slug: "construccion", imagen: null },
  { slug: "hogar-y-jardin", imagen: null },
];
