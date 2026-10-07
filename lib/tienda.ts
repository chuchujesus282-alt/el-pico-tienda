// Datos de la tienda física (página /ubicanos). ÚNICO lugar donde se cambian.
// Dirección y coordenadas confirmadas por persona A el 2026-10-07 (fichas de Google Maps/Waze, código Plus F6FG+PWH).
// Horario y teléfono: aún sin confirmar, por eso no se muestran.

export const TIENDA = {
  nombre: "Centro Ferretero El Pico",
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
