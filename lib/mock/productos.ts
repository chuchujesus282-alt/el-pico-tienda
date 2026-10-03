import type { Producto } from "@/types/catalogo";

// Datos de prueba mientras CATALOGO_API_URL no esté definida.
// Marcas ficticias; imagen en null para usar el placeholder de ProductCard.
type FilaMock = [id: string, nombre: string, marca: string | null, precio: number, subcategoria: string | null];

function crear(categoriaSlug: string, filas: FilaMock[]): Producto[] {
  return filas.map(([id, nombre, marca, precio, subcategoria]) => ({
    id,
    nombre,
    marca,
    precio,
    imagen: null,
    categoriaSlug,
    subcategoria,
  }));
}

export const productosMock: Producto[] = [
  ...crear("plomeria", [
    ["00201005", 'NIPLE GALVANIZADO 1 1/2" X 4"', "AQUAFLEX", 6.01, "Conexiones"],
    ["00201214", "GRIFO LAVAMANOS MONOMANDO CROMADO", "HIDROSUR", 45.43, "Grifería"],
    ["00201377", 'VALVULA DE BOLA PVC 3/4"', "AQUAFLEX", 4.75, "Válvulas"],
    ["00201420", 'TUBO PVC AGUA FRIA 1/2" X 6MTS', "TUBOVEN", 8.9, "Tuberías"],
    ["00201563", "MANGUERA FLEXIBLE LAVAMANOS 40CM", "HIDROSUR", 3.85, "Conexiones"],
  ]),
  ...crear("herramientas", [
    ["00302011", "TALADRO PERCUTOR 1/2\" 650W", "PROTEK", 68.5, "Eléctricas"],
    ["00302045", "MARTILLO UÑA 16OZ MANGO FIBRA", "FORJAMAX", 9.2, "Manuales"],
    ["00302088", "JUEGO DE DESTORNILLADORES 6 PIEZAS", "FORJAMAX", 12.4, "Manuales"],
    ["00302130", 'ESMERIL ANGULAR 4 1/2" 820W', "PROTEK", 54.99, "Eléctricas"],
    ["00302177", "CINTA METRICA 5MTS X 19MM", "MEDIPRO", 5.6, "Medición"],
  ]),
  ...crear("electricidad", [
    ["00403002", "BOMBILLO LED 12W LUZ BLANCA E27", "LUMEN", 2.35, "Iluminación"],
    ["00403019", "CABLE THW #12 ROLLO 100MTS", "CONDUVEN", 89.0, "Cables"],
    ["00403055", "TOMACORRIENTE DOBLE CON TIERRA 15A", "VOLTIKA", 3.1, "Accesorios"],
    ["00403071", "BREAKER 1 POLO 20A ENCHUFABLE", "VOLTIKA", 7.8, "Protección"],
    ["00403096", "EXTENSION ELECTRICA 3 TOMAS 5MTS", "LUMEN", 11.25, "Accesorios"],
  ]),
  ...crear("pinturas", [
    ["00504010", "PINTURA CAUCHO BLANCA PAILA 4 GALONES", "COLORVEN", 33.95, "Caucho"],
    ["00504033", "ESMALTE SINTETICO NEGRO 1 GALON", "COLORVEN", 21.4, "Esmaltes"],
    ["00504058", 'RODILLO ANTIGOTA 9" CON MANGO', "PINTAFACIL", 6.3, "Accesorios"],
    ["00504072", "BROCHA CERDA NATURAL 3\"", "PINTAFACIL", 2.15, "Accesorios"],
    ["00504099", "IMPERMEABILIZANTE TECHO ROJO CUÑETE", "SELLAMAX", 112.6, "Impermeabilizantes"],
  ]),
  ...crear("construccion", [
    ["00605004", "CEMENTO GRIS SACO 42.5KG", "CEMENVEN", 9.75, "Cementos"],
    ["00605027", "PEGO PARA CERAMICA SACO 10KG", "ADHEMAX", 6.9, "Adhesivos"],
    ["00605041", "BLOQUE DE ARCILLA 15X20X30", null, 0.65, "Bloques"],
    ["00605066", "CABILLA 3/8\" X 6MTS", "ACEROVEN", 4.2, "Acero"],
    ["00605083", "ESCALERA ALUMINIO EXTENSIBLE 24 PELDAÑOS", "ALTURA", 289.0, "Escaleras"],
  ]),
  ...crear("tornilleria", [
    ["00706008", "TORNILLO DRYWALL 6X1\" CAJA 100 UNIDADES", "FIJATEC", 3.4, "Tornillos"],
    ["00706024", 'CLAVO DE ACERO 2" CAJA 1KG', "FIJATEC", 4.15, "Clavos"],
    ["00706049", 'TARUGO PLASTICO 1/4" BOLSA 50 UNIDADES', "ANCLAPLUS", 1.8, "Anclajes"],
    ["00706063", 'PERNO HEXAGONAL GALVANIZADO 3/8" X 2"', "FIJATEC", 0.55, "Pernos"],
    ["00706087", "SILICON TRANSPARENTE CARTUCHO 280ML", "SELLAMAX", 4.95, "Selladores"],
  ]),
  ...crear("jardin", [
    ["00807012", 'TIJERA PODAR 22" MANGO TUBULAR', "VERDEPRO", 17.24, "Herramientas de jardín"],
    ["00807035", 'MANGUERA JARDIN 1/2" X 20MTS', "VERDEPRO", 18.6, "Riego"],
    ["00807050", "PALA PUNTA REDONDA MANGO MADERA", "FORJAMAX", 14.3, "Herramientas de jardín"],
    ["00807074", "ASPERSOR CIRCULAR METALICO", "VERDEPRO", 7.45, "Riego"],
    ["00807091", "CARRETILLA 5 PIES CUBICOS RUEDA NEUMATICA", "ALTURA", 96.8, "Carretillas"],
  ]),
  ...crear("seguridad", [
    ["00908003", "GUANTES DE CARNAZA REFORZADOS PAR", "SEGURPRO", 3.7, "Guantes"],
    ["00908026", "LENTES DE SEGURIDAD CLAROS ANTIEMPAÑANTE", "SEGURPRO", 2.9, "Protección visual"],
    ["00908042", "CASCO DE SEGURIDAD BLANCO CON RATCHET", "SEGURPRO", 8.4, "Protección de cabeza"],
    ["00908068", "BOTAS DE SEGURIDAD PUNTA DE ACERO TALLA 42", "PASOFIRME", 39.9, "Calzado"],
    ["00908085", "MASCARILLA N95 CAJA 10 UNIDADES", null, 12.5, "Protección respiratoria"],
  ]),
];

// Selección manual por sección de la página principal (en producción la define la API).
export const destacadosMock: Record<string, string[]> = {
  "te-puede-interesar": [
    "00504010", "00302011", "00807012", "00201214", "00403019",
    "00605083", "00706087", "00908068", "00302130", "00504099",
  ],
  recomendados: [
    "00403002", "00302045", "00605004", "00908003", "00201377",
    "00504058", "00807035", "00706008", "00403071", "00302177",
  ],
};
