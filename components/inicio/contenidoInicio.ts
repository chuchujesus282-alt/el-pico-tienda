import { Bolt, BrickWall, Drill, Droplets, HardHat, MessageCircle, PaintRoller, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import type { Banner, Producto } from "@/types/catalogo";

// Contenido editable de la página principal: banners, pasos de compra, logos de marcas y
// secciones por categoría. Mientras no haya imágenes en public/banners/ y public/marcas/,
// se muestran versiones hechas con los colores de marca; al poner `imagen`/`logo`, se usa la imagen.

export type VarianteBanner = "azul" | "oscuro" | "claro";

export type BannerInicio = Omit<Banner, "imagen"> & {
  imagen: string | null; // ruta en public/banners/ o URL absoluta
  titulo: string;
  texto?: string;
  textoBoton?: string;
  variante?: VarianteBanner;
  icono?: LucideIcon;
};

export type Marca = {
  nombre: string;
  logo: string | null; // ruta en public/marcas/
};

export type SeccionCategoriaInicio = {
  slug: string;
  banner: Omit<BannerInicio, "id" | "href" | "titulo" | "alt">;
};

export const bannersPrincipales: BannerInicio[] = [
  {
    id: "obra",
    imagen: null,
    alt: "Materiales de construcción en El Pico",
    href: "/categoria/construccion",
    titulo: "Todo para tu obra en un solo lugar",
    texto: "Cemento, bloques, pegos y más para construir sin paradas.",
    textoBoton: "Ver materiales",
    variante: "azul",
    icono: BrickWall,
  },
  {
    id: "herramientas",
    imagen: null,
    alt: "Herramientas en El Pico",
    href: "/categoria/herramientas",
    titulo: "Herramientas que rinden",
    texto: "Taladros, esmeriles y herramientas manuales para cada trabajo.",
    textoBoton: "Ver herramientas",
    variante: "oscuro",
    icono: Drill,
  },
  {
    id: "pinturas",
    imagen: null,
    alt: "Pinturas en El Pico",
    href: "/categoria/pinturas",
    titulo: "Renueva tus espacios",
    texto: "Pinturas, rodillos y brochas para darle color a tu casa.",
    textoBoton: "Ver pinturas",
    variante: "azul",
    icono: PaintRoller,
  },
];

export const bannersLaterales: BannerInicio[] = [
  {
    id: "plomeria",
    imagen: null,
    alt: "Plomería y grifería en El Pico",
    href: "/categoria/plomeria",
    titulo: "Plomería y grifería",
    texto: "Tuberías, conexiones y grifos.",
    textoBoton: "Ver plomería",
    variante: "claro",
    icono: Droplets,
  },
  {
    id: "asesoria",
    imagen: null,
    alt: "Asesoría por WhatsApp",
    href: enlaceWhatsApp("¡Hola, El Pico! Necesito asesoría para saber qué comprar."),
    titulo: "¿No sabes qué necesitas?",
    texto: "Cuéntanos tu trabajo y te decimos qué llevar.",
    textoBoton: "Pregúntanos",
    variante: "oscuro",
    icono: MessageCircle,
  },
];

export const pasosCompra = [
  { titulo: "Arma tu pedido", texto: "Agrega al carrito lo que necesitas." },
  { titulo: "Envíalo por WhatsApp", texto: "El mensaje sale listo, con códigos y cantidades." },
  { titulo: "Te confirmamos", texto: "Disponibilidad y forma de pago, directo con la tienda." },
];

export const bannersPromocionales: BannerInicio[] = [
  {
    id: "seguridad",
    imagen: null,
    alt: "Seguridad industrial en El Pico",
    href: "/categoria/seguridad",
    titulo: "Trabaja protegido",
    texto: "Cascos, guantes, botas y mascarillas de seguridad industrial.",
    textoBoton: "Ver seguridad",
    variante: "azul",
    icono: HardHat,
  },
  {
    id: "tornilleria",
    imagen: null,
    alt: "Tornillería en El Pico",
    href: "/categoria/tornilleria",
    titulo: "Tornillería de todas las medidas",
    texto: "Tornillos, tuercas, anclajes y fijaciones.",
    textoBoton: "Ver tornillería",
    variante: "claro",
    icono: Bolt,
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

export const seccionesCategoria: SeccionCategoriaInicio[] = [
  {
    slug: "construccion",
    banner: {
      imagen: null,
      texto: "Cemento, bloques y todo lo que tu obra necesita.",
      textoBoton: "Ver categoría",
      variante: "oscuro",
      icono: BrickWall,
    },
  },
  {
    slug: "jardin",
    banner: {
      imagen: null,
      texto: "Palas, carretillas, mangueras y aspersores para tu jardín.",
      textoBoton: "Ver categoría",
      variante: "claro",
      icono: Sprout,
    },
  },
];
