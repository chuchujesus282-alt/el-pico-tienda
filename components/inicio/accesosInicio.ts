import { Bolt, BrickWall, Calculator, Car, CircleHelp, Clock, Droplets, Hammer, HardHat, MapPin, Package, PaintRoller, Sprout, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";

// Accesos del inicio que llevan a otras páginas. Se editan aquí, sin tocar los componentes.

/** Ícono de cada categoría en "Compra por categoría" (clave: slug). Una categoría nueva sin ícono usa el genérico. */
export const ICONOS_CATEGORIA: Record<string, LucideIcon> = {
  herramientas: Hammer,
  construccion: BrickWall,
  ferreteria: Bolt,
  electricidad: Zap,
  plomeria: Droplets,
  pinturas: PaintRoller,
  "hogar-y-jardin": Sprout,
  "seguridad-industrial": HardHat,
  vehiculos: Car,
};
export const ICONO_CATEGORIA_GENERICO: LucideIcon = Package;

export type AccesoAyuda = { titulo: string; texto: string; href: string; icono: LucideIcon };

/** Tarjetas de "Estamos para ayudarte", al final del inicio. */
export const ACCESOS_AYUDA: AccesoAyuda[] = [
  { titulo: "Calcula tu proyecto", texto: "Descubre cuánto material necesitas para tu obra.", href: RUTA_CALCULADORAS, icono: Calculator },
  { titulo: "Cómo comprar", texto: "Arma tu pedido y envíalo por WhatsApp, paso a paso.", href: "/como-comprar", icono: CircleHelp },
  { titulo: "Ubícanos", texto: "Mira el mapa y llega con Google Maps o Waze.", href: "/ubicanos", icono: MapPin },
  { titulo: "Horario", texto: "Revisa si estamos abiertos antes de venir.", href: "/horario", icono: Clock },
];
