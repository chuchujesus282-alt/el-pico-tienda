import type { Producto } from "@/types/catalogo";

// Datos de prueba mientras CATALOGO_API_URL no esté definida.
// Marcas ficticias. Imágenes DE PRUEBA en public/productos/{id}.webp (fotos libres de Wikimedia Commons,
// créditos en public/productos/CREDITOS.md); con la API, las imágenes vienen del sistema.
// `ventas`: unidades inventadas de los últimos 90 días (ordenan los "más vendidos").
type FilaMock = [
  id: string,
  nombre: string,
  marca: string | null,
  precio: number,
  subcategoria: string | null,
  ventas: number,
];

function crear(categoriaSlug: string, filas: FilaMock[]): Producto[] {
  return filas.map(([id, nombre, marca, precio, subcategoria, ventas]) => ({
    id,
    nombre,
    marca,
    precio,
    imagen: `/productos/${id}.webp`,
    categoriaSlug,
    subcategoria,
    ventas,
  }));
}

export const productosMock: Producto[] = [
  ...crear("plomeria", [
    ["00201005", 'NIPLE GALVANIZADO 1 1/2" X 4"', "AQUAFLEX", 6.01, "Conexiones", 64],
    ["00201214", "GRIFO LAVAMANOS MONOMANDO CROMADO", "HIDROSUR", 45.43, "Grifería", 21],
    ["00201377", 'VALVULA DE BOLA PVC 3/4"', "AQUAFLEX", 4.75, "Válvulas", 88],
    ["00201420", 'TUBO PVC AGUA FRIA 1/2" X 6MTS', "TUBOVEN", 8.9, "Tuberías", 140],
    ["00201563", "MANGUERA FLEXIBLE LAVAMANOS 40CM", "HIDROSUR", 3.85, "Conexiones", 57],
    ["00201610", 'CODO PVC AGUA FRIA 1/2" X 90°', "TUBOVEN", 0.45, "Conexiones", 310],
    ["00201634", 'CODO PVC AGUA FRIA 3/4" X 90°', "TUBOVEN", 0.6, "Conexiones", 185],
    ["00201658", "PEGA PARA PVC 1/4 GALON", "ADHEMAX", 7.9, "Adhesivos", 120],
    ["00201682", 'CINTA TEFLON 1/2" X 10MTS', "AQUAFLEX", 0.5, "Conexiones", 420],
  ]),
  ...crear("herramientas", [
    ["00302011", "TALADRO PERCUTOR 1/2\" 650W", "PROTEK", 68.5, "Eléctricas", 34],
    ["00302045", "MARTILLO UÑA 16OZ MANGO FIBRA", "FORJAMAX", 9.2, "Manuales", 76],
    ["00302088", "JUEGO DE DESTORNILLADORES 6 PIEZAS", "FORJAMAX", 12.4, "Manuales", 49],
    ["00302130", 'ESMERIL ANGULAR 4 1/2" 820W', "PROTEK", 54.99, "Eléctricas", 27],
    ["00302177", "CINTA METRICA 5MTS X 19MM", "MEDIPRO", 5.6, "Medición", 95],
    ["00302204", 'BROCA PARA CONCRETO 3/8" X 6"', "PROTEK", 2.8, "Brocas", 160],
    ["00302228", 'BROCA PARA CONCRETO 1/4" X 4"', "PROTEK", 1.95, "Brocas", 210],
    ["00302252", 'BROCA PARA METAL HSS 3/8"', "FORJAMAX", 3.6, "Brocas", 72],
    ["00302276", 'DESTORNILLADOR DE PALA 1/4" X 4"', "FORJAMAX", 2.4, "Manuales", 110],
    ["00302290", 'LLAVE AJUSTABLE 10" CROMADA', "FORJAMAX", 8.75, "Manuales", 66],
    ["00302314", 'ARCO DE SEGUETA 12" CON HOJA', "FORJAMAX", 6.2, "Manuales", 41],
    // Materiales de las calculadoras de proyectos (precios de prueba, referenciales del mercado venezolano).
    ["00302338", 'NIVEL DE ALUMINIO 24"', "MEDIPRO", 9.4, "Medición", 44],
    ["00302354", 'ESPATULA DE ACERO 4" MANGO MADERA', "FORJAMAX", 3.1, "Manuales", 61],
  ]),
  ...crear("electricidad", [
    ["00403002", "BOMBILLO LED 12W LUZ BLANCA E27", "LUMEN", 2.35, "Iluminación", 380],
    ["00403019", "CABLE THW #12 ROLLO 100MTS", "CONDUVEN", 89.0, "Cables", 38],
    ["00403055", "TOMACORRIENTE DOBLE CON TIERRA 15A", "VOLTIKA", 3.1, "Accesorios", 150],
    ["00403071", "BREAKER 1 POLO 20A ENCHUFABLE", "VOLTIKA", 7.8, "Protección", 62],
    ["00403096", "EXTENSION ELECTRICA 3 TOMAS 5MTS", "LUMEN", 11.25, "Accesorios", 44],
    ["00403120", 'CINTA AISLANTE NEGRA 3/4" X 18MTS', "VOLTIKA", 1.25, "Accesorios", 460],
  ]),
  ...crear("pinturas", [
    ["00504010", "PINTURA CAUCHO BLANCA PAILA 4 GALONES", "COLORVEN", 33.95, "Caucho", 130],
    ["00504033", "ESMALTE SINTETICO NEGRO 1 GALON", "COLORVEN", 21.4, "Esmaltes", 55],
    ["00504058", 'RODILLO ANTIGOTA 9" CON MANGO', "PINTAFACIL", 6.3, "Accesorios", 98],
    ["00504072", "BROCHA CERDA NATURAL 3\"", "PINTAFACIL", 2.15, "Accesorios", 175],
    ["00504099", "IMPERMEABILIZANTE TECHO ROJO CUÑETE", "SELLAMAX", 112.6, "Impermeabilizantes", 18],
    ["00504115", 'BANDEJA PARA RODILLO 9" PLASTICA', "PINTAFACIL", 2.9, "Accesorios", 80],
    ["00504131", 'CINTA DE PAPEL 1" X 40MTS', "ADHEMAX", 1.6, "Accesorios", 230],
    ["00504157", "PINTURA CAUCHO BLANCA 1 GALON", "COLORVEN", 11.5, "Caucho", 260],
    // Materiales de las calculadoras de proyectos (precios de prueba, referenciales del mercado venezolano).
    ["00504173", "SELLADOR ANTIALCALINO BLANCO 1 GALON", "COLORVEN", 13.5, "Fondos", 72],
    ["00504199", "MANTO ASFALTICO 3MM ROLLO 10M2", "SELLAMAX", 34, "Impermeabilizantes", 48],
    ["00504214", "PRIMER ASFALTICO 1 GALON", "SELLAMAX", 11.8, "Impermeabilizantes", 36],
  ]),
  ...crear("construccion", [
    ["00605004", "CEMENTO GRIS SACO 42.5KG", "CEMENVEN", 9.75, "Cementos", 520],
    ["00605027", "PEGO PARA CERAMICA SACO 10KG", "ADHEMAX", 6.9, "Adhesivos", 140],
    ["00605041", "BLOQUE DE ARCILLA 15X20X30", null, 0.65, "Bloques", 900],
    ["00605066", "CABILLA 3/8\" X 6MTS", "ACEROVEN", 4.2, "Acero", 300],
    ["00605083", "ESCALERA ALUMINIO EXTENSIBLE 24 PELDAÑOS", "ALTURA", 289.0, "Escaleras", 6],
    ["00605109", "LLANA LISA DE ACERO 11\" MANGO MADERA", "FORJAMAX", 5.4, "Herramientas de albañilería", 85],
    ["00605125", 'CUCHARA DE ALBAÑIL 8"', "FORJAMAX", 4.6, "Herramientas de albañilería", 70],
    ["00605141", "BALDE PLASTICO DE ALBAÑIL 12 LITROS", "ALTURA", 3.3, "Herramientas de albañilería", 115],
    ["00605167", "CEMENTO BLANCO BOLSA 1KG", "CEMENVEN", 1.9, "Cementos", 90],
    // Materiales de las calculadoras de proyectos (precios de prueba, referenciales del mercado venezolano).
    ["00605183", "ARENA LAVADA METRO CUBICO", null, 32, "Agregados", 95],
    ["00605209", 'PIEDRA PICADA 3/4" METRO CUBICO', null, 38, "Agregados", 70],
    ["00605225", "BLOQUE DE ARCILLA 10X20X30", null, 0.52, "Bloques", 640],
    ["00605241", "BLOQUE DE ARCILLA 20X20X30", null, 0.85, "Bloques", 310],
    ["00605267", "BLOQUE DE CONCRETO 10X20X40", null, 0.75, "Bloques", 420],
    ["00605283", "BLOQUE DE CONCRETO 15X20X40", null, 0.95, "Bloques", 560],
    ["00605308", "BLOQUE DE CONCRETO 20X20X40", null, 1.2, "Bloques", 280],
    ["00605324", 'CABILLA 1/2" X 6MTS', "ACEROVEN", 7.4, "Acero", 260],
    ["00605340", 'CABILLA 5/8" X 6MTS', "ACEROVEN", 11.6, "Acero", 120],
    ["00605366", "ALAMBRE DULCE CALIBRE 18 ROLLO 1KG", "ACEROVEN", 2.6, "Acero", 150],
    ["00605382", "CERAMICA PARA PISO 45X45 CAJA 2.03M2", "PISOVEN", 13.9, "Revestimientos", 88],
    ["00605407", "PORCELANATO 60X60 CAJA 1.44M2", "PISOVEN", 24.5, "Revestimientos", 54],
    ["00605423", "CARATO BLANCO BOLSA 2KG", "ADHEMAX", 3.2, "Revestimientos", 76],
    ["00605449", "LAMINA DE ZINC ONDULADA 3.66M X 0.80M", "TECHOVEN", 12.8, "Techos", 110],
    ["00605465", "LAMINA ACEROLIT 3.66M X 0.80M", "TECHOVEN", 27.5, "Techos", 62],
    ["00605481", 'LAMINA DRYWALL 1/2" 1.22 X 2.44M', "PANELVEN", 9.8, "Drywall", 135],
    ["00605506", 'PARAL METALICO DRYWALL 2 1/2" X 3.05M', "PANELVEN", 3.4, "Drywall", 190],
    ["00605522", 'RIEL METALICO DRYWALL 2 1/2" X 3.05M', "PANELVEN", 3.1, "Drywall", 120],
    ["00605548", "MASILLA PARA DRYWALL GALON 5KG", "PANELVEN", 6.9, "Drywall", 84],
    ["00605564", "CINTA DE PAPEL PARA JUNTAS DRYWALL 75MTS", "PANELVEN", 3.3, "Drywall", 66],
    // Venía de la antigua "Ferretería" (por eso su código empieza en 007).
    ["00706087", "SILICON TRANSPARENTE CARTUCHO 280ML", "SELLAMAX", 4.95, "Selladores", 105],
  ]),
  ...crear("tornilleria", [
    ["00706008", "TORNILLO DRYWALL 6X1\" CAJA 100 UNIDADES", "FIJATEC", 3.4, "Tornillos", 240],
    ["00706024", 'CLAVO DE ACERO 2" CAJA 1KG', "FIJATEC", 4.15, "Clavos", 130],
    ["00706049", 'TARUGO PLASTICO 1/4" BOLSA 50 UNIDADES', "ANCLAPLUS", 1.8, "Anclajes", 280],
    ["00706063", 'PERNO HEXAGONAL GALVANIZADO 3/8" X 2"', "FIJATEC", 0.55, "Pernos", 200],
    ["00706102", 'TORNILLO AUTORROSCANTE 1/4" X 2" BOLSA 50 UNIDADES', "FIJATEC", 2.75, "Tornillos", 330],
    ["00706128", 'TORNILLOS PARA MADERA 1/4" X 1 1/2" CAJA 100 UNIDADES', "FIJATEC", 4.1, "Tornillos", 190],
    ["00706144", 'TORNILLO HEXAGONAL 3/8" X 3" GALVANIZADO', "FIJATEC", 0.7, "Tornillos", 145],
    ["00706160", 'RAMPLUG PLASTICO 3/8" BOLSA 25 UNIDADES', "ANCLAPLUS", 1.5, "Anclajes", 165],
    // Materiales de las calculadoras de proyectos (precios de prueba, referenciales del mercado venezolano).
    ["00706186", 'TORNILLO AUTOPERFORANTE PARA TECHO 2 1/2" CON ARANDELA BOLSA 100 UNIDADES', "FIJATEC", 9.5, "Tornillos", 58],
  ]),
  ...crear("cerrajeria", [
    ["01110016", "CANDADO DE LATON 40MM 3 LLAVES", "CERROX", 6.9, "Candados", 96],
    ["01110032", "CANDADO DE BRONCE MACIZO 50MM", "CERROX", 11.5, "Candados", 54],
    ["01110058", "CILINDRO DE LATON 60MM 5 LLAVES", "CERROX", 9.8, "Cilindros", 47],
    ["01110074", "CERRADURA DE POMO PARA BAÑO CON SEGURO", "LLAVETEC", 12.6, "Cerraduras", 38],
    ["01110090", "CERRADURA DE MANILLA ACERO INOXIDABLE CON LLAVE", "LLAVETEC", 24.9, "Cerraduras", 22],
    ["01110115", 'BISAGRA DE ACERO 3" X 3" PAR', "CERROX", 2.4, "Bisagras", 180],
    ["01110131", 'PORTACANDADO GALVANIZADO 4"', "CERROX", 3.2, "Portacandados", 75],
  ]),
  ...crear("hogar-y-jardin", [
    ["00807012", 'TIJERA PODAR 22" MANGO TUBULAR', "VERDEPRO", 17.24, "Herramientas de jardín", 23],
    ["00807035", 'MANGUERA JARDIN 1/2" X 20MTS', "VERDEPRO", 18.6, "Riego", 52],
    ["00807050", "PALA PUNTA REDONDA MANGO MADERA", "FORJAMAX", 14.3, "Herramientas de jardín", 74],
    ["00807074", "ASPERSOR CIRCULAR METALICO", "VERDEPRO", 7.45, "Riego", 31],
    ["00807091", "CARRETILLA 5 PIES CUBICOS RUEDA NEUMATICA", "ALTURA", 96.8, "Carretillas", 15],
  ]),
  ...crear("seguridad-industrial", [
    ["00908003", "GUANTES DE CARNAZA REFORZADOS PAR", "SEGURPRO", 3.7, "Guantes", 210],
    ["00908026", "LENTES DE SEGURIDAD CLAROS ANTIEMPAÑANTE", "SEGURPRO", 2.9, "Protección visual", 92],
    ["00908042", "CASCO DE SEGURIDAD BLANCO CON RATCHET", "SEGURPRO", 8.4, "Protección de cabeza", 47],
    ["00908068", "BOTAS DE SEGURIDAD PUNTA DE ACERO TALLA 42", "PASOFIRME", 39.9, "Calzado", 29],
    ["00908085", "MASCARILLA N95 CAJA 10 UNIDADES", null, 12.5, "Protección respiratoria", 60],
  ]),
  ...crear("vehiculos", [
    ["01009014", "GATO HIDRAULICO TIPO BOTELLA 4 TONELADAS", "ALZAPRO", 27.5, "Herramientas para vehículos", 19],
    ["01009031", "CABLES PARA PASAR CORRIENTE 400A 3MTS", "VOLTIKA", 15.8, "Accesorios", 26],
    ["01009057", "ACEITE MOTOR 20W50 MINERAL 1 LITRO", "MOTORVEN", 6.45, "Lubricantes", 170],
    ["01009072", "LLAVE EN CRUZ PARA RUEDAS 17-19-21-23MM", "FORJAMAX", 9.9, "Herramientas para vehículos", 35],
    ["01009098", "TRIANGULO DE SEGURIDAD REFLECTIVO", "SEGURPRO", 7.2, "Accesorios", 40],
  ]),
];

// Selección manual por sección de la página principal (en producción la define la API).
// "Te puede interesar" ya no está aquí: lo arma lib/recomendaciones/ (más vendidos + perfil del cliente).
export const destacadosMock: Record<string, string[]> = {
  recomendados: [
    "00403002", "00302045", "00605004", "00908003", "00201377",
    "00504058", "00807035", "00706008", "00403071", "00302177",
  ],
};
