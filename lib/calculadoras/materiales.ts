// Mapeo material → producto del catálogo. Es lo ÚNICO que hay que editar cuando cambie un código:
// `productoId` es el código del producto en el sistema (el mismo `id` de types/catalogo.ts).
// Con `productoId: null` (o si el código ya no existe en el catálogo), el material sale igual en el
// resumen con su cantidad y la etiqueta "Consultar disponibilidad".
// 2026-11-09 (persona B): las calculadoras se ajustaron a lo que la tienda vende de verdad (códigos de Saint revisados
// en la tienda publicada, con su descripción). Las medidas y presentaciones salen de esos productos (constantes.ts).
// Quedan en null los que no hay o cuya presentación no se sabe: alambre de amarre y llana lisa.

export type Material = {
  /** Nombre corto que ve el cliente si no hay producto asociado. */
  nombre: string;
  /** Unidad de venta, ej. "Saco de 42,5 kg". */
  presentacion: string;
  productoId: string | null;
};

export const MATERIALES = {
  // Obra gris
  cemento: { nombre: "Cemento gris", presentacion: "Saco de 42,5 kg", productoId: "CONST0082" },
  arena: { nombre: "Arena lavada", presentacion: "Metro cúbico (m³)", productoId: "CONST0010" },
  piedra: { nombre: "Piedra", presentacion: "Metro cúbico (m³)", productoId: "CONST0018" },
  "bloque-arcilla-10": { nombre: "Bloque de arcilla de 10 cm", presentacion: "Unidad (10 × 20 × 30 cm)", productoId: "CONST0001" },
  "bloque-arcilla-12": { nombre: "Bloque de arcilla de 12 cm", presentacion: "Unidad (12 × 20 × 30 cm)", productoId: "CONST0003" },
  "bloque-arcilla-15": { nombre: "Bloque de arcilla de 15 cm", presentacion: "Unidad (15 × 20 × 30 cm)", productoId: "CONST0005" },
  "bloque-concreto-10": { nombre: "Bloque Aliven de 10 cm", presentacion: "Unidad", productoId: "CONST0121" },
  "bloque-concreto-12": { nombre: "Bloque Aliven de 12 cm", presentacion: "Unidad", productoId: "CONST0122" },
  "bloque-concreto-15": { nombre: "Bloque Aliven de 15 cm", presentacion: "Unidad", productoId: "CONST0123" },
  "bloque-concreto-20": { nombre: "Bloque Aliven de 20 cm", presentacion: "Unidad", productoId: "CONST0124" },
  "cabilla-3/8": { nombre: 'Cabilla estriada de 3/8"', presentacion: "Barra de 12 m", productoId: "CONST0424" },
  "cabilla-1/2": { nombre: 'Cabilla estriada de 1/2"', presentacion: "Barra de 12 m", productoId: "CONST0429" },
  "cabilla-5/8": { nombre: 'Cabilla estriada de 5/8"', presentacion: "Barra de 6 m", productoId: "CONST0423" },
  alambre: { nombre: "Alambre de amarre", presentacion: "Rollo de 1 kg", productoId: null },
  // Pintura e impermeabilización
  "pintura-cunete": { nombre: "Pintura de caucho", presentacion: "Tobo de 4 galones", productoId: "MANP0103" },
  "pintura-galon": { nombre: "Pintura de caucho", presentacion: "Galón", productoId: "MANP0102" },
  sellador: { nombre: "Fondo antialcalino", presentacion: "Galón", productoId: "MANP0112" },
  manto: { nombre: "Manto asfáltico de 3,15 mm", presentacion: "Rollo de 10 m²", productoId: "IPA0030" },
  "primer-asfaltico": { nombre: "Primer asfáltico", presentacion: "Galón", productoId: "IPA0055" },
  "impermeabilizante-acrilico": { nombre: "Impermeabilizante acrílico", presentacion: "Cuñete de 4 galones", productoId: "GN00838" },
  // Pisos y revestimientos
  ceramica: { nombre: "Cerámica 30 × 30 cm", presentacion: "Caja de 1,62 m²", productoId: "CERAM002" },
  porcelanato: { nombre: "Porcelanato 60 × 60 cm", presentacion: "Caja de 1,44 m²", productoId: "CERAM045" },
  pego: { nombre: "Pego gris para cerámica", presentacion: "Kilo", productoId: "GN09940" },
  carato: { nombre: "Carato", presentacion: "Bolsa de 2 kg", productoId: "GN07202" },
  // Techos: la lámina se elige del largo que mejor cubre la caída (techo.ts).
  "lamina-zinc-244": { nombre: "Lámina de zinc ondulada de 2,44 m", presentacion: "Lámina de 2,44 × 0,80 m", productoId: "GN11418" },
  "lamina-zinc-300": { nombre: "Lámina de zinc ondulada de 3,00 m", presentacion: "Lámina de 3,00 × 0,80 m", productoId: "GN11419" },
  "lamina-zinc-360": { nombre: "Lámina de zinc ondulada de 3,60 m", presentacion: "Lámina de 3,60 × 0,80 m", productoId: "GN11420" },
  "lamina-acerotec-300": { nombre: "Lámina Acerotec/Superlit de 3,00 m", presentacion: "Lámina de 3,00 m", productoId: "CONST0168" },
  "lamina-acerotec-400": { nombre: "Lámina Acerotec/Superlit de 4,00 m", presentacion: "Lámina de 4,00 m", productoId: "CONST0169" },
  "lamina-acerotec-600": { nombre: "Lámina Acerotec/Superlit de 6,00 m", presentacion: "Lámina de 6,00 m", productoId: "GN11101" },
  "tornillo-techo": { nombre: 'Tornillo autotaladrante 14 × 1"', presentacion: "Unidad", productoId: "TOR1146" },
  // Drywall
  "lamina-drywall": { nombre: 'Lámina de drywall de 1/2"', presentacion: "Lámina de 1,22 × 2,44 m", productoId: "CONST0032" },
  paral: { nombre: 'Paral metálico de 2-1/2"', presentacion: "Perfil de 3,05 m", productoId: "GN09858" },
  riel: { nombre: 'Riel metálico de 2-1/2"', presentacion: "Perfil de 3,05 m", productoId: "GN09861" },
  "tornillo-drywall": { nombre: 'Tornillo para drywall 6 × 1"', presentacion: "Unidad", productoId: "TOR1220" },
  "cinta-juntas": { nombre: "Cinta de papel para juntas", presentacion: "Rollo de 76 m", productoId: "GN60272" },
  masilla: { nombre: "Pasta para drywall", presentacion: "Galón", productoId: "RAMA0006" },
  // Herramientas y extras recomendados
  cuchara: { nombre: "Cuchara de albañil", presentacion: "Unidad", productoId: "GN03409" },
  llana: { nombre: "Llana lisa", presentacion: "Unidad", productoId: null },
  balde: { nombre: "Tobo de albañil", presentacion: "Unidad", productoId: "PRLF0073" },
  carretilla: { nombre: "Carretilla", presentacion: "Unidad", productoId: "MULTP005" },
  pala: { nombre: "Pala", presentacion: "Unidad", productoId: "BLLT0128" },
  nivel: { nombre: "Nivel de aluminio", presentacion: "Unidad", productoId: "NIKAT087" },
  "cinta-metrica": { nombre: "Cinta métrica de 5 m", presentacion: "Unidad", productoId: "BRUF0525" },
  guantes: { nombre: "Guantes de carnaza", presentacion: "Par", productoId: "GN14750" },
  lentes: { nombre: "Lentes de seguridad", presentacion: "Unidad", productoId: "GN03721" },
  segueta: { nombre: "Arco de segueta", presentacion: "Unidad", productoId: "BRUF0168" },
  rodillo: { nombre: "Rodillo con bandeja", presentacion: "Set", productoId: "GN00188" },
  brocha: { nombre: 'Brocha de 2"', presentacion: "Unidad", productoId: "JABAL024" },
  bandeja: { nombre: "Bandeja para rodillo", presentacion: "Unidad", productoId: "GN12764" },
  "cinta-enmascarar": { nombre: "Cinta de papel (tirro)", presentacion: "Rollo", productoId: "CELV0006" },
  espatula: { nombre: "Espátula", presentacion: "Unidad", productoId: "LBS0108" },
  taladro: { nombre: "Taladro percutor", presentacion: "Unidad", productoId: "NIKAT081" },
  escalera: { nombre: "Escalera doméstica", presentacion: "Unidad", productoId: "ALD0030" },
} as const satisfies Record<string, Material>;

export type IdMaterial = keyof typeof MATERIALES;

/** Códigos de producto (sin repetir) que usa una lista de materiales. */
export function codigosDeProductos(ids: readonly IdMaterial[]): string[] {
  return [...new Set(ids.map((id) => MATERIALES[id].productoId).filter((c): c is NonNullable<typeof c> => c !== null))];
}
