// Escenas del banner de calculadoras del inicio (BannerCalculadorasInicio): rotan solas, en este orden. Para cambiar
// un texto, una medida o una cantidad, se cambia aquí y nada más. `dibujo` elige qué se anima en el plano.

export type MaterialEscena = {
  nombre: string;
  detalle: string;
  cantidad: number;
  unidad: string;
};

export type EscenaCalculadora = {
  /** Texto de la pestaña. */
  pestana: string;
  /** Qué se dibuja en el plano. */
  dibujo: "pared" | "losa" | "pintura";
  /** Encabezado y etiqueta de la tarjeta de materiales. */
  titulo: string;
  etiqueta: string;
  /** Cotas del plano (ancho abajo, alto a la derecha). */
  ancho: string;
  alto: string;
  /** Contador sobre el plano: nombre, número final y unidad pegada al número (ej. " m²"). */
  contador: { nombre: string; valor: number; unidad: string };
  /** Materiales de la tarjeta (el primero cuenta junto con el dibujo; los demás, después). */
  materiales: MaterialEscena[];
};

export const ESCENAS_CALCULADORAS: EscenaCalculadora[] = [
  {
    pestana: "Paredes",
    dibujo: "pared",
    titulo: "Pared 4 × 2,5 m",
    etiqueta: "Bloque de 15",
    ancho: "4,00 m",
    alto: "2,50 m",
    contador: { nombre: "Bloques", valor: 127, unidad: "" },
    materiales: [
      { nombre: "Bloques de arcilla", detalle: "15 × 20 × 30 cm", cantidad: 127, unidad: "und" },
      { nombre: "Cemento gris", detalle: "Saco de 42,5 kg", cantidad: 2, unidad: "sacos" },
      { nombre: "Arena lavada", detalle: "Para el mortero", cantidad: 1, unidad: "m³" },
    ],
  },
  {
    pestana: "Losas",
    dibujo: "losa",
    titulo: "Losa 5 × 4 m",
    etiqueta: "Malla c/20 cm",
    ancho: "5,00 m",
    alto: "4,00 m",
    contador: { nombre: "Cabillas", valor: 38, unidad: "" },
    materiales: [
      { nombre: 'Cabillas de 3/8"', detalle: "Barras de 6 m", cantidad: 38, unidad: "und" },
      { nombre: "Alambre de amarre", detalle: "Recocido cal. 18", cantidad: 5, unidad: "kg" },
      { nombre: "Separadores", detalle: "Panelas de concreto", cantidad: 40, unidad: "und" },
    ],
  },
  {
    pestana: "Pintura",
    dibujo: "pintura",
    titulo: "Habitación 3 × 4 m",
    etiqueta: "2 manos",
    ancho: "4,00 m",
    alto: "2,50 m",
    contador: { nombre: "Área", valor: 32, unidad: " m²" },
    materiales: [
      { nombre: "Pintura de caucho", detalle: "Satinada, galón", cantidad: 3, unidad: "gal" },
      { nombre: "Sellador", detalle: "Primera mano", cantidad: 1, unidad: "gal" },
      { nombre: "Rodillo y brocha", detalle: "Kit de pintor", cantidad: 1, unidad: "kit" },
    ],
  },
];

/** Cuánto dura cada escena (lo que tarda en llenarse la barra de su pestaña). */
export const DURACION_ESCENA_MS = 8200;
