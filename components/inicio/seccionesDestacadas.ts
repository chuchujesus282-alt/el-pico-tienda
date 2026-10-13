import {
  Bolt,
  BrickWall,
  Cable,
  Columns3,
  Cylinder,
  Drill,
  Grid3x3,
  HardHat,
  House,
  Package,
  PaintBucket,
  PaintRoller,
  ShowerHead,
  Sprout,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SeccionCirculo } from "@/components/ui/CirculosSecciones";

// Círculos de "Lo más buscado" (inicio) e íconos de las subcategorías (páginas de categoría).
// ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR para cambiar qué círculos aparecen, su orden,
// su enlace o su imagen. No hace falta tocar ningún componente.

/** Enlace a una subcategoría: el mismo que arma el filtro de la página de categoría. */
export const hrefSubcategoria = (categoria: string, subcategoria: string) =>
  `/categoria/${categoria}?subcategoria=${encodeURIComponent(subcategoria)}`;

/** Enlace a una búsqueda, para secciones que no son una subcategoría (ej. "Taladros"). */
export const hrefBusqueda = (texto: string) => `/buscar?q=${encodeURIComponent(texto)}`;

/**
 * Círculos del inicio, en orden. Cada uno lleva:
 * - `nombre`: el texto bajo el círculo.
 * - `href`: a dónde lleva (usa hrefSubcategoria o hrefBusqueda).
 * - `icono`: ícono lineal de respaldo (lucide-react).
 * - `imagen`: opcional. Pon aquí la ruta de una foto recortada sin fondo, ej. "/secciones/cemento.png"
 *   (guárdala en public/secciones/), y reemplaza al ícono automáticamente.
 */
export const SECCIONES_DESTACADAS: SeccionCirculo[] = [
  { nombre: "Cemento", href: hrefSubcategoria("construccion", "Cementos"), icono: Package, imagen: null },
  { nombre: "Bloques", href: hrefSubcategoria("construccion", "Bloques"), icono: BrickWall, imagen: null },
  { nombre: "Cabillas", href: hrefSubcategoria("construccion", "Acero"), icono: Grid3x3, imagen: null },
  { nombre: "Pinturas de caucho", href: hrefSubcategoria("pinturas", "Caucho"), icono: PaintBucket, imagen: null },
  { nombre: "Brochas y rodillos", href: hrefSubcategoria("pinturas", "Accesorios"), icono: PaintRoller, imagen: null },
  { nombre: "Taladros", href: hrefBusqueda("taladro"), icono: Drill, imagen: null },
  { nombre: "Tuberías PVC", href: hrefSubcategoria("plomeria", "Tuberías"), icono: Cylinder, imagen: null },
  { nombre: "Grifería", href: hrefSubcategoria("plomeria", "Grifería"), icono: ShowerHead, imagen: null },
  { nombre: "Cables", href: hrefSubcategoria("electricidad", "Cables"), icono: Cable, imagen: null },
  { nombre: "Breakers", href: hrefSubcategoria("electricidad", "Protección"), icono: Zap, imagen: null },
  { nombre: "Tornillos y clavos", href: hrefSubcategoria("ferreteria", "Tornillos"), icono: Bolt, imagen: null },
  { nombre: "Drywall", href: hrefSubcategoria("construccion", "Drywall"), icono: Columns3, imagen: null },
  { nombre: "Guantes y cascos", href: "/categoria/seguridad-industrial", icono: HardHat, imagen: null },
  { nombre: "Mangueras y riego", href: hrefSubcategoria("hogar-y-jardin", "Riego"), icono: Sprout, imagen: null },
];

/**
 * Ícono de cada subcategoría en las páginas de categoría (clave: el nombre tal como viene del sistema).
 * Una subcategoría que no esté aquí usa el ícono genérico. Para ponerle foto, agrégala en IMAGENES_SUBCATEGORIA.
 */
export const ICONOS_SUBCATEGORIA: Record<string, LucideIcon> = {
  Cementos: Package,
  Bloques: BrickWall,
  Acero: Grid3x3,
  Techos: House,
  Drywall: Columns3,
  Caucho: PaintBucket,
  Esmaltes: PaintBucket,
  Fondos: PaintBucket,
  Accesorios: PaintRoller,
  Tuberías: Cylinder,
  Grifería: ShowerHead,
  Cables: Cable,
  Protección: Zap,
  Tornillos: Bolt,
  Pernos: Bolt,
  Eléctricas: Drill,
  Guantes: HardHat,
  "Protección de cabeza": HardHat,
  Riego: Sprout,
  "Herramientas de jardín": Sprout,
};
export const ICONO_SUBCATEGORIA_GENERICO: LucideIcon = Package;

/** Foto recortada de una subcategoría (opcional), ej. { Bloques: "/secciones/bloques.png" }. */
export const IMAGENES_SUBCATEGORIA: Record<string, string> = {};
