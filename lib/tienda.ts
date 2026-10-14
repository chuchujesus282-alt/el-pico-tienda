// Datos de la tienda física (página /ubicanos). ÚNICO lugar donde se cambian.
// Dirección y coordenadas confirmadas por persona A el 2026-10-07 (fichas de Google Maps/Waze, código Plus F6FG+PWH).
// Horario: en lib/horario.ts (página /horario). Correo y teléfonos: en CONTACTO, abajo (página /contacto).

export const TIENDA = {
  nombre: "Centro Ferretero El Pico",
  /** Responsable legal (confirmado por persona A el 2026-10-07). */
  razonSocial: "Centro Ferretero El Pico, C.A.",
  rif: "J-30440607-0",
  /** Dirección en líneas, como se muestra en la página. */
  direccion: ["Carretera Petare–Santa Lucía, km 6", "Sector El Limoncito, Fila de Mariches"],
  ciudad: "Caracas 1073, estado Miranda",
  /** Para copiar y compartir en una sola línea. */
  direccionCompleta:
    "Centro Ferretero El Pico, Carretera Petare–Santa Lucía, km 6, El Limoncito, Fila de Mariches, Caracas 1073, Miranda, Venezuela",
  /** Código Plus de Google: sirve para encontrar la tienda en cualquier app de mapas. */
  codigoPlus: "F6FG+PWH Caracas",
  latitud: 10.47431,
  longitud: -66.77264,
  /** Ficha de la tienda en Google Maps (abre el lugar exacto, con fotos y reseñas). */
  googlePlaceId: "ChIJv1SRgrpXKowRj0RRuhF8vmM",
} as const;

export type Telefono = {
  /** Para qué es ese número, ej. "Ventas", "Tienda", "Administración". */
  etiqueta: string;
  /** Como se muestra: "0212-555-1234" o "0414-555-1234". */
  numero: string;
};

/**
 * Correo y teléfonos de la tienda (página /contacto). PENDIENTE: persona A los envía.
 * Mientras estén vacíos, la página muestra "Muy pronto" en su lugar; al llenarlos aparecen solos.
 */
export const CONTACTO: { correo: string | null; telefonos: Telefono[] } = {
  correo: null, // ej. "ventas@elpico.com.ve"
  telefonos: [], // ej. [{ etiqueta: "Tienda", numero: "0212-555-1234" }]
};

/** "0212-555-1234" → "tel:+582125551234" (sirve para llamar con un toque desde el teléfono). */
export function enlaceLlamada(numero: string): string {
  return `tel:+58${numero.replace(/\D/g, "").replace(/^0/, "")}`;
}

const q = encodeURIComponent;
const coordenadas = `${TIENDA.latitud},${TIENDA.longitud}`;

export type AppMapas = { id: "google" | "waze" | "apple"; nombre: string; detalle: string; href: string };

/** Enlaces para abrir la tienda en cada app (en el teléfono abren la app si está instalada). */
export const APPS_MAPAS: AppMapas[] = [
  {
    id: "google",
    nombre: "Google Maps",
    detalle: "Ver la tienda y cómo llegar",
    href: `https://www.google.com/maps/search/?api=1&query=${q(TIENDA.nombre)}&query_place_id=${TIENDA.googlePlaceId}`,
  },
  {
    id: "waze",
    nombre: "Waze",
    detalle: "Navegar hasta la tienda",
    href: `https://waze.com/ul?ll=${coordenadas}&navigate=yes&zoom=17`,
  },
  {
    id: "apple",
    nombre: "Apple Maps",
    detalle: "Para iPhone, iPad y Mac",
    href: `https://maps.apple.com/?q=${q(TIENDA.nombre)}&ll=${coordenadas}&z=16`,
  },
];
