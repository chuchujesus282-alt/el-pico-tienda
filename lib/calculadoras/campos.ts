import type { Campo } from "./tipos";

/** Medidas de una pared: las comparten bloques, friso, pintura y drywall. */
export const CAMPOS_PARED: Campo[] = [
  { id: "largo", etiqueta: "Largo de la pared", unidad: "m", defecto: null, maximo: 500, ayuda: "Si son varias paredes, suma sus largos." },
  { id: "alto", etiqueta: "Alto de la pared", unidad: "m", defecto: 2.5, maximo: 30 },
  {
    id: "vanos",
    etiqueta: "Puertas y ventanas a descontar",
    unidad: "m²",
    defecto: null,
    opcional: true,
    maximo: 5000,
    ayuda: "Una puerta normal mide unos 1,9 m² y una ventana de 1 × 1 m, 1 m².",
  },
];

/** Largo y ancho de una superficie horizontal (piso, losa, techo plano). */
export const CAMPOS_SUPERFICIE: Campo[] = [
  { id: "largo", etiqueta: "Largo", unidad: "m", defecto: null, maximo: 500 },
  { id: "ancho", etiqueta: "Ancho", unidad: "m", defecto: null, maximo: 500 },
];
