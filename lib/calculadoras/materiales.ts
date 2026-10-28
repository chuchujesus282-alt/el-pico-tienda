// Mapeo material → producto del catálogo. Es lo ÚNICO que hay que editar cuando cambie un código:
// `productoId` es el código del producto en el sistema (el mismo `id` de types/catalogo.ts).
// Con `productoId: null` (o si el código ya no existe en el catálogo), el material sale igual en el
// resumen con su cantidad y la etiqueta "Consultar disponibilidad".
// 2026-10-28: todos en null. Apuntaban a productos de EJEMPLO, que se borraron al conectar todo a Saint. Los códigos
// reales propuestos están en docs/pendiente-buscador-servidor.md ("Calculadoras"), pendientes de revisar con persona B.

export type Material = {
  /** Nombre corto que ve el cliente si no hay producto asociado. */
  nombre: string;
  /** Unidad de venta, ej. "Saco de 42,5 kg". */
  presentacion: string;
  productoId: string | null;
};

export const MATERIALES = {
  // Obra gris
  cemento: { nombre: "Cemento gris", presentacion: "Saco de 42,5 kg", productoId: null },
  arena: { nombre: "Arena lavada", presentacion: "Metro cúbico (m³)", productoId: null },
  piedra: { nombre: 'Piedra picada 3/4"', presentacion: "Metro cúbico (m³)", productoId: null },
  "bloque-arcilla-10": { nombre: "Bloque de arcilla de 10 cm", presentacion: "Unidad (10 × 20 × 30 cm)", productoId: null },
  "bloque-arcilla-15": { nombre: "Bloque de arcilla de 15 cm", presentacion: "Unidad (15 × 20 × 30 cm)", productoId: null },
  "bloque-arcilla-20": { nombre: "Bloque de arcilla de 20 cm", presentacion: "Unidad (20 × 20 × 30 cm)", productoId: null },
  "bloque-concreto-10": { nombre: "Bloque de concreto de 10 cm", presentacion: "Unidad (10 × 20 × 40 cm)", productoId: null },
  "bloque-concreto-15": { nombre: "Bloque de concreto de 15 cm", presentacion: "Unidad (15 × 20 × 40 cm)", productoId: null },
  "bloque-concreto-20": { nombre: "Bloque de concreto de 20 cm", presentacion: "Unidad (20 × 20 × 40 cm)", productoId: null },
  "cabilla-3/8": { nombre: 'Cabilla de 3/8"', presentacion: "Barra de 6 m", productoId: null },
  "cabilla-1/2": { nombre: 'Cabilla de 1/2"', presentacion: "Barra de 6 m", productoId: null },
  "cabilla-5/8": { nombre: 'Cabilla de 5/8"', presentacion: "Barra de 6 m", productoId: null },
  alambre: { nombre: "Alambre de amarre", presentacion: "Rollo de 1 kg", productoId: null },
  // Pintura e impermeabilización
  "pintura-cunete": { nombre: "Pintura de caucho", presentacion: "Cuñete de 4 galones", productoId: null },
  "pintura-galon": { nombre: "Pintura de caucho", presentacion: "Galón", productoId: null },
  sellador: { nombre: "Sellador antialcalino", presentacion: "Galón", productoId: null },
  manto: { nombre: "Manto asfáltico de 3 mm", presentacion: "Rollo de 10 m²", productoId: null },
  "primer-asfaltico": { nombre: "Primer asfáltico", presentacion: "Galón", productoId: null },
  "impermeabilizante-acrilico": { nombre: "Impermeabilizante acrílico", presentacion: "Cuñete de 5 galones", productoId: null },
  // Pisos y revestimientos
  ceramica: { nombre: "Cerámica 45 × 45 cm", presentacion: "Caja de 2,03 m²", productoId: null },
  porcelanato: { nombre: "Porcelanato 60 × 60 cm", presentacion: "Caja de 1,44 m²", productoId: null },
  pego: { nombre: "Pego para cerámica", presentacion: "Saco de 10 kg", productoId: null },
  carato: { nombre: "Carato", presentacion: "Bolsa de 2 kg", productoId: null },
  // Techos
  "lamina-zinc": { nombre: "Lámina de zinc ondulada", presentacion: "Lámina de 3,66 × 0,80 m", productoId: null },
  "lamina-acerolit": { nombre: "Lámina de acerolit", presentacion: "Lámina de 3,66 × 0,80 m", productoId: null },
  "tornillo-techo": { nombre: "Tornillo autoperforante para techo", presentacion: "Bolsa de 100", productoId: null },
  // Drywall
  "lamina-drywall": { nombre: 'Lámina de drywall de 1/2"', presentacion: "Lámina de 1,22 × 2,44 m", productoId: null },
  paral: { nombre: "Paral metálico", presentacion: "Perfil de 3,05 m", productoId: null },
  riel: { nombre: "Riel metálico", presentacion: "Perfil de 3,05 m", productoId: null },
  "tornillo-drywall": { nombre: "Tornillo para drywall", presentacion: "Caja de 100", productoId: null },
  "cinta-juntas": { nombre: "Cinta de papel para juntas", presentacion: "Rollo de 75 m", productoId: null },
  masilla: { nombre: "Masilla para drywall", presentacion: "Galón de 5 kg", productoId: null },
  // Herramientas y extras recomendados
  cuchara: { nombre: "Cuchara de albañil", presentacion: "Unidad", productoId: null },
  llana: { nombre: "Llana lisa", presentacion: "Unidad", productoId: null },
  balde: { nombre: "Balde de albañil", presentacion: "Unidad", productoId: null },
  carretilla: { nombre: "Carretilla", presentacion: "Unidad", productoId: null },
  pala: { nombre: "Pala", presentacion: "Unidad", productoId: null },
  nivel: { nombre: "Nivel de aluminio", presentacion: "Unidad", productoId: null },
  "cinta-metrica": { nombre: "Cinta métrica", presentacion: "Unidad", productoId: null },
  guantes: { nombre: "Guantes de carnaza", presentacion: "Par", productoId: null },
  lentes: { nombre: "Lentes de seguridad", presentacion: "Unidad", productoId: null },
  segueta: { nombre: "Arco de segueta", presentacion: "Unidad", productoId: null },
  rodillo: { nombre: "Rodillo antigota", presentacion: "Unidad", productoId: null },
  brocha: { nombre: "Brocha", presentacion: "Unidad", productoId: null },
  bandeja: { nombre: "Bandeja para rodillo", presentacion: "Unidad", productoId: null },
  "cinta-enmascarar": { nombre: "Cinta de papel", presentacion: "Rollo", productoId: null },
  espatula: { nombre: "Espátula", presentacion: "Unidad", productoId: null },
  taladro: { nombre: "Taladro percutor", presentacion: "Unidad", productoId: null },
  escalera: { nombre: "Escalera de aluminio", presentacion: "Unidad", productoId: null },
} as const satisfies Record<string, Material>;

export type IdMaterial = keyof typeof MATERIALES;

/** Códigos de producto (sin repetir) que usa una lista de materiales. */
export function codigosDeProductos(ids: readonly IdMaterial[]): string[] {
  return [...new Set(ids.map((id) => MATERIALES[id].productoId).filter((c): c is NonNullable<typeof c> => c !== null))];
}
