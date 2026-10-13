// Mapeo material → producto del catálogo. Es lo ÚNICO que hay que editar cuando cambie un código:
// `productoId` es el código del producto en el sistema (el mismo `id` de types/catalogo.ts).
// Con `productoId: null` (o si el código ya no existe en el catálogo), el material sale igual en el
// resumen con su cantidad y la etiqueta "Consultar disponibilidad".

export type Material = {
  /** Nombre corto que ve el cliente si no hay producto asociado. */
  nombre: string;
  /** Unidad de venta, ej. "Saco de 42,5 kg". */
  presentacion: string;
  productoId: string | null;
};

export const MATERIALES = {
  // Obra gris
  cemento: { nombre: "Cemento gris", presentacion: "Saco de 42,5 kg", productoId: "00605004" },
  arena: { nombre: "Arena lavada", presentacion: "Metro cúbico (m³)", productoId: "00605183" },
  piedra: { nombre: 'Piedra picada 3/4"', presentacion: "Metro cúbico (m³)", productoId: "00605209" },
  "bloque-arcilla-10": { nombre: "Bloque de arcilla de 10 cm", presentacion: "Unidad (10 × 20 × 30 cm)", productoId: "00605225" },
  "bloque-arcilla-15": { nombre: "Bloque de arcilla de 15 cm", presentacion: "Unidad (15 × 20 × 30 cm)", productoId: "00605041" },
  "bloque-arcilla-20": { nombre: "Bloque de arcilla de 20 cm", presentacion: "Unidad (20 × 20 × 30 cm)", productoId: "00605241" },
  "bloque-concreto-10": { nombre: "Bloque de concreto de 10 cm", presentacion: "Unidad (10 × 20 × 40 cm)", productoId: "00605267" },
  "bloque-concreto-15": { nombre: "Bloque de concreto de 15 cm", presentacion: "Unidad (15 × 20 × 40 cm)", productoId: "00605283" },
  "bloque-concreto-20": { nombre: "Bloque de concreto de 20 cm", presentacion: "Unidad (20 × 20 × 40 cm)", productoId: "00605308" },
  "cabilla-3/8": { nombre: 'Cabilla de 3/8"', presentacion: "Barra de 6 m", productoId: "00605066" },
  "cabilla-1/2": { nombre: 'Cabilla de 1/2"', presentacion: "Barra de 6 m", productoId: "00605324" },
  "cabilla-5/8": { nombre: 'Cabilla de 5/8"', presentacion: "Barra de 6 m", productoId: "00605340" },
  alambre: { nombre: "Alambre de amarre", presentacion: "Rollo de 1 kg", productoId: "00605366" },
  // Pintura e impermeabilización
  "pintura-cunete": { nombre: "Pintura de caucho", presentacion: "Cuñete de 4 galones", productoId: "00504010" },
  "pintura-galon": { nombre: "Pintura de caucho", presentacion: "Galón", productoId: "00504157" },
  sellador: { nombre: "Sellador antialcalino", presentacion: "Galón", productoId: "00504173" },
  manto: { nombre: "Manto asfáltico de 3 mm", presentacion: "Rollo de 10 m²", productoId: "00504199" },
  "primer-asfaltico": { nombre: "Primer asfáltico", presentacion: "Galón", productoId: "00504214" },
  "impermeabilizante-acrilico": { nombre: "Impermeabilizante acrílico", presentacion: "Cuñete de 5 galones", productoId: "00504099" },
  // Pisos y revestimientos
  ceramica: { nombre: "Cerámica 45 × 45 cm", presentacion: "Caja de 2,03 m²", productoId: "00605382" },
  porcelanato: { nombre: "Porcelanato 60 × 60 cm", presentacion: "Caja de 1,44 m²", productoId: "00605407" },
  pego: { nombre: "Pego para cerámica", presentacion: "Saco de 10 kg", productoId: "00605027" },
  carato: { nombre: "Carato", presentacion: "Bolsa de 2 kg", productoId: "00605423" },
  // Techos
  "lamina-zinc": { nombre: "Lámina de zinc ondulada", presentacion: "Lámina de 3,66 × 0,80 m", productoId: "00605449" },
  "lamina-acerolit": { nombre: "Lámina de acerolit", presentacion: "Lámina de 3,66 × 0,80 m", productoId: "00605465" },
  "tornillo-techo": { nombre: "Tornillo autoperforante para techo", presentacion: "Bolsa de 100", productoId: "00706186" },
  // Drywall
  "lamina-drywall": { nombre: 'Lámina de drywall de 1/2"', presentacion: "Lámina de 1,22 × 2,44 m", productoId: "00605481" },
  paral: { nombre: "Paral metálico", presentacion: "Perfil de 3,05 m", productoId: "00605506" },
  riel: { nombre: "Riel metálico", presentacion: "Perfil de 3,05 m", productoId: "00605522" },
  "tornillo-drywall": { nombre: "Tornillo para drywall", presentacion: "Caja de 100", productoId: "00706008" },
  "cinta-juntas": { nombre: "Cinta de papel para juntas", presentacion: "Rollo de 75 m", productoId: "00605564" },
  masilla: { nombre: "Masilla para drywall", presentacion: "Galón de 5 kg", productoId: "00605548" },
  // Herramientas y extras recomendados
  cuchara: { nombre: "Cuchara de albañil", presentacion: "Unidad", productoId: "00605125" },
  llana: { nombre: "Llana lisa", presentacion: "Unidad", productoId: "00605109" },
  balde: { nombre: "Balde de albañil", presentacion: "Unidad", productoId: "00605141" },
  carretilla: { nombre: "Carretilla", presentacion: "Unidad", productoId: "00807091" },
  pala: { nombre: "Pala", presentacion: "Unidad", productoId: "00807050" },
  nivel: { nombre: "Nivel de aluminio", presentacion: "Unidad", productoId: "00302338" },
  "cinta-metrica": { nombre: "Cinta métrica", presentacion: "Unidad", productoId: "00302177" },
  guantes: { nombre: "Guantes de carnaza", presentacion: "Par", productoId: "00908003" },
  lentes: { nombre: "Lentes de seguridad", presentacion: "Unidad", productoId: "00908026" },
  segueta: { nombre: "Arco de segueta", presentacion: "Unidad", productoId: "00302314" },
  rodillo: { nombre: "Rodillo antigota", presentacion: "Unidad", productoId: "00504058" },
  brocha: { nombre: "Brocha", presentacion: "Unidad", productoId: "00504072" },
  bandeja: { nombre: "Bandeja para rodillo", presentacion: "Unidad", productoId: "00504115" },
  "cinta-enmascarar": { nombre: "Cinta de papel", presentacion: "Rollo", productoId: "00504131" },
  espatula: { nombre: "Espátula", presentacion: "Unidad", productoId: "00302354" },
  taladro: { nombre: "Taladro percutor", presentacion: "Unidad", productoId: "00302011" },
  escalera: { nombre: "Escalera de aluminio", presentacion: "Unidad", productoId: "00605083" },
} as const satisfies Record<string, Material>;

export type IdMaterial = keyof typeof MATERIALES;

/** Códigos de producto (sin repetir) que usa una lista de materiales. */
export function codigosDeProductos(ids: readonly IdMaterial[]): string[] {
  return [...new Set(ids.map((id) => MATERIALES[id].productoId).filter((c): c is NonNullable<typeof c> => c !== null))];
}
