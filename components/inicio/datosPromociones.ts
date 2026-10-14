import { Bolt, HardHat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hrefSubcategoria } from "./seccionesDestacadas";

// Los dos avisos grandes del inicio ("Trabaja protegido" y "Tornillería de todas las medidas").
// Se editan aquí: textos, enlaces, fotos (de public/) y accesos rápidos a subcategorías.

export type Promocion = {
  id: string;
  /** Texto pequeño sobre el título. */
  etiqueta: string;
  titulo: string;
  texto: string;
  href: string;
  textoBoton: string;
  /** "azul": fondo azul marino con texto blanco. "claro": fondo azul claro con texto azul marino. */
  variante: "azul" | "claro";
  icono: LucideIcon;
  /** Dos fotos de productos (en public/), montadas a la derecha. */
  fotos: [string, string];
  /** Accesos rápidos bajo el botón. */
  accesos: { texto: string; href: string }[];
};

export const PROMOCIONES: Promocion[] = [
  {
    id: "seguridad",
    etiqueta: "Seguridad industrial",
    titulo: "Trabaja protegido",
    texto: "Cascos, guantes, botas y mascarillas para cuidarte en cada obra.",
    href: "/categoria/seguridad-industrial",
    textoBoton: "Ver seguridad",
    variante: "azul",
    icono: HardHat,
    fotos: ["/productos/00908042.webp", "/productos/00908003.webp"],
    accesos: [
      { texto: "Guantes", href: hrefSubcategoria("seguridad-industrial", "Guantes") },
      { texto: "Cascos", href: hrefSubcategoria("seguridad-industrial", "Protección de cabeza") },
      { texto: "Botas", href: hrefSubcategoria("seguridad-industrial", "Calzado") },
    ],
  },
  {
    id: "tornilleria",
    etiqueta: "Ferretería",
    titulo: "Tornillería de todas las medidas",
    texto: "Tornillos, clavos, anclajes y pernos para fijar lo que necesites.",
    href: "/categoria/ferreteria",
    textoBoton: "Ver tornillería",
    variante: "claro",
    icono: Bolt,
    fotos: ["/productos/00706128.webp", "/productos/00706063.webp"],
    accesos: [
      { texto: "Tornillos", href: hrefSubcategoria("ferreteria", "Tornillos") },
      { texto: "Anclajes", href: hrefSubcategoria("ferreteria", "Anclajes") },
      { texto: "Pernos", href: hrefSubcategoria("ferreteria", "Pernos") },
    ],
  },
];
