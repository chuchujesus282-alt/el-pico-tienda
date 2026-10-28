// Reclasificación de los productos de Saint por su NOMBRE (persona B, 2026-10-28). En Saint, la categoría Herramientas
// (1171) trae de todo: bombas de agua, gatos de carro, desmalezadoras, pasadores, barras de silicón… y su subcategoría
// "Herramientas eléctricas" mezcla mechas, carbones, correas y resortes. Aquí cada producto va a la categoría de la web
// y a la subcategoría donde un cliente lo buscaría. Lógica pura (sin servidor), con pruebas en
// lib/__tests__/clasificacionSaint.test.ts. La usa lib/saint.ts al convertir la respuesta.
//
// Cómo funciona: REGLAS en orden; gana la primera cuyo patrón aparece en el nombre (en MAYÚSCULAS y sin acentos). Si
// ninguna aplica, el producto se queda en su categoría con la subcategoría de Saint (pasada por SUBCATEGORIA_SAINT).
// Para corregir un producto: agrega o ajusta una regla ANTES de la que lo atrapa hoy, y corre `npm test`.

export type Destino = { categoria: string; subcategoria: string };

// ---------- subcategorías (los nombres que ve el cliente en el filtro) ----------
export const H = {
  electricas: "Herramientas eléctricas",
  baterias: "Baterías y cargadores",
  accesorios: "Accesorios para herramientas",
  repuestos: "Repuestos para herramientas",
  manuales: "Herramientas manuales",
  cajas: "Cajas y organizadores",
  medicion: "Herramientas de medición",
  aire: "Aire comprimido",
  soldadura: "Soldadura y oxicorte",
  combustion: "Herramientas a combustión",
  elevacion: "Elevación y amarre",
  metalmecanica: "Metalmecánica",
  obra: "Equipos de construcción",
  industriales: "Repuestos industriales",
} as const;

/** Orden de las subcategorías en el filtro de cada categoría (las que no están aquí van al final, por nombre). */
export const ORDEN_SUBCATEGORIAS: Record<string, string[]> = {
  herramientas: [H.electricas, H.manuales, H.accesorios, H.medicion, H.aire, H.soldadura, H.combustion, H.obra, H.baterias, H.cajas, H.elevacion, H.metalmecanica, H.repuestos, H.industriales],
};

const herr = (subcategoria: string): Destino => ({ categoria: "herramientas", subcategoria });
const a = (categoria: string, subcategoria: string): Destino => ({ categoria, subcategoria });

const PLOMERIA_BOMBAS = a("plomeria", "Bombas e hidroneumáticos");
const PLOMERIA_DESTAPE = a("plomeria", "Destape de tuberías");
const PLOMERIA_GAS = a("plomeria", "Gas doméstico");
const PLOMERIA_GRIFERIA = a("plomeria", "Grifería");
const JARDIN_HERRAMIENTAS = a("hogar-y-jardin", "Herramientas de jardín");
const JARDIN_EQUIPOS = a("hogar-y-jardin", "Equipos de jardín");
const JARDIN_REPUESTOS = a("hogar-y-jardin", "Repuestos para equipos de jardín");
const HOGAR = a("hogar-y-jardin", "Hogar");
const AUTO_GATOS = a("vehiculos", "Gatos y elevación");
const AUTO_HERRAMIENTAS = a("vehiculos", "Herramientas para vehículos");
const AUTO_LUBRICACION = a("vehiculos", "Lubricación y fluidos");
const AUTO_BATERIAS = a("vehiculos", "Cargadores de batería");
const AUTO_REPUESTOS = a("vehiculos", "Repuestos automotrices");
const TORN_PASADORES = a("tornilleria", "Pasadores y chavetas");
const TORN_REMACHES = a("tornilleria", "Remaches");
const TORN_CLAVOS = a("tornilleria", "Clavos");
const CONSTR_ADHESIVOS = a("construccion", "Adhesivos");
const ELECTRICIDAD = a("electricidad", "Accesorios");

/** Repuestos de carro en las bocinas (bujes): "BOCINA P/FIAT", "P/DELCO"… Las de electrodomésticos no entran. */
const AUTOS = "FIAT|FORD|DODGE|CHEV|CHRYSL|TOYOTA|MAZDA|MITSU|RENAULT|DELCO|DELC|DELREY|DUCELLIER|BLAZER|CHEVROLET|CIGUE|BISAGRA|SOBREMEDIDA";

/**
 * Tipos de herramienta de mano. Si el nombre EMPIEZA por uno (detrás de la marca y de "JUEGO DE"), es una herramienta
 * manual aunque traiga "1000V", "PUNTA" o "C/CADENA" más adelante. Cada tipo lleva sus excepciones (pinza de tierra,
 * martillo demoledor, llave de impacto…). Lo que no empiece así sigue por las demás reglas.
 */
const TIPO_MANUAL =
  "ALICATES?|PINZAS?(?! (PORTA|P\\/TIERRA|PARA TIERRA|TIERRA|AMPERIM))|TENAZAS?|CINCEL(?!.*SDS)|" +
  "DESTORNILL?ADOR(ES)?|DESTONILLADOR|DEST\\.|REMACHADORA|REMACHADOR|RAYADOR|ARCO(?! DE SIERRA P)|DADOS?(?!.*(BUJIA|TARRAJA))|" +
  "MARTILLO(?! (DEMOLED|PERCUTOR|ELECTRICO|ROTO|DE IMPACTO|P\\/SOLDADOR|PARA SOLDADOR))|MANDARRIA|MAZO|" +
  "LLAVES?(?! (DE )?(IMPACTO|CRUZ)|.*(MANDRIL|BUJIA|MOTORIZADO))|EXTRACTOR(?!.*(VALVULA|AIRE|HUMO|LIQUIDO))|" +
  "TALADRO BERBIQUI|BERBIQUI|COMPAS|RACHET|RATCHET|PATA DE CABRA|SACA ?RETEN|PELA ?CABLES?|CORTA ?TUBOS?|CORTATUBOS?|" +
  "CIZALLA|TIJERAS?(?!.*(POD|JARDIN|FLORI))|NAVAJA|PRENSA(?!.*HIDRAULICA)|FORMON|GUBIAS?|BOTADORE?S?|PONCHADORA|CRIMPEADORA|" +
  "ESPATULAS?|PALUSTRA|SERRUCHO(?!.*POD)|MULTIHERRAMIENTA?S?(?!.*(OSCIL|ELECTR|\\d+W|\\d+V|INALAMBR))";
const NO_ES_MANUAL = "(?!P\\/|PARA |REPUESTO|REPUES\\.|PUNTAS?\\b|MECHAS?\\b|DISCOS?\\b|HOJAS?\\b|CEPILLO|ADAPTADOR|KIT P|JUEGO P|TARRAJA|ESLINGA|SENORITA|SEÑORITA)";
const MANUAL = new RegExp(`^(${NO_ES_MANUAL}\\S+ ){0,3}([A-Z]+\\.)?(${TIPO_MANUAL})(\\b|\\.)|\\b1000 ?V\\b|\\bAISLAD`);

/**
 * Reglas en orden: [patrón sobre el nombre (MAYÚSCULAS, sin acentos), destino]. Gana la primera que aparece.
 * Agrupadas por destino para leerlas; el orden importa solo donde un nombre podría caer en dos (lo más específico primero).
 */
const REGLAS: [RegExp, Destino][] = [
  // ===== casos puntuales que otra regla atraparía mal =====
  [/MECHA.*SDS|SDS.*MECHA|\bRODEL\b|LLAVE (P\/|PARA )MANDRIL|CEPILLO (CIRCULAR|T\/COPA|T\/BROCHA|DE COPA)|CEPILLO.*P\/(TALADRO|ESMERIL)|PIEDRA P\/AMOLAR|MEZCLADORA? (DE |P\/)PINTURA|BATIDOR\/MEZCLADOR|REMOVEDOR (DE )?PINTURA|PORTAHERRAMIENTAS|ACCESORIOS P\/DREMEL|P\/DREMEL|SOPORTE P\/ESMERIL|TUERCA PARA ESMERIL|CEPILLO ESMERIL|BROCHA FRESADORA|PIEDRAS P\/PULIR|PZAS PERFORADORA|^\S+ PTA \d|INSTALAR CERRADURA/, herr(H.accesorios)],
  [/PRESOSTATO.*(COMPRESOR|PALANCA|95-125|70-80)|PRESOSTATO (DE PALANCA|PARA COMPRESOR)/, herr(H.aire)],
  [/^(\S+ )?PICO PUNTA|PISTOLA P\/CLAVOS|REMACHADORA(?!.*NEUMAT)|REMACHADOR PROF|PELA CABLE|SACA RETEN|LLAVE DE CORREA|MALETIN EXTRACTOR/, herr(H.manuales)],
  [/TROMPO MEZCLADOR|\bVIBRADOR\b|VIBROCOMPACTADORA|\bAPISONADOR\b|MEZCLADOR ELECTRICO .*LTS/, herr(H.obra)],
  [/NYLON.*DESMALEZ|BUJIA (PARA|P\/) (CORTAGRAMA|DESMALEZADORA)|CADENA (PARA|P\/) MOTOSIERRA|LIMA MOTOSIERRA|\bTRIMMER\b/, JARDIN_REPUESTOS],

  // ===== fuera de Herramientas =====
  // Plomería: bombas de agua y sus repuestos, hidroneumáticos, presostatos; destape; gas de cocina; grifería.
  [/\bBOMBA (DE )?AGUA\b|\bBOMBA (SUMERG|CENTRIF|PERIFER|PISCINA|RECIRCUL|PARA FUENTE|DIPAK|ICB|P\/CONDENSADO|PRUEBA PRESION|\d)|\bMOTOBOMBA\b|\bHIDRONEUMATICO\b|\bHIDROCOMPACTO\b|\bPRESOSTATO\b|\bPRES+ ?CONTROL\b|\bEASYPRESS\b|\bIMPELER\b|\bFLOTANTE\b|\bCITY ?PUMPS?\b|\bPEDROLLO\b|\bDRAFEX\b|^DAB\b|PRESURIZACION|RELE ALTERNADOR|TABLERO DE CONTROL.*BOMBA|\bTANQUE\b.*\b(HIDRO|GAL|LTS?|BOMBA)\b|CARGADOR AIRE P\/HIDRO|SELLO MECANICO|SELLO PARA BOMBA|TAPON BOMBA|TAPA (DE ARRIBA|TRASERA) PARA BOMBA|\bASPA PLASTICA PARA BOMBA|PARA HIDROCOMPACTO|EMPALME P\/BOMBA/, PLOMERIA_BOMBAS],
  [/\bDESTAPADORA\b|\bDESATASCADOR\b|\bGUAYA\b|DESTAPACANOS|DESTAPACAÑOS/, PLOMERIA_DESTAPE],
  [/REGULADOR (P\/|PARA )BOMBONA|AUTOGAS REGULADOR|ADAPTADOR P\/BOMBONA/, PLOMERIA_GAS],
  [/\bMONOMANDO\b/, PLOMERIA_GRIFERIA],
  [/BUJIA CARBON ACTIVADO/, a("plomeria", "Filtros de agua")],

  // Vehículos: gatos y equipo de taller; herramientas de mecánico; lubricación y trasvase de fluidos; cargadores de
  // batería de carro; repuestos de carro (bocinas "P/FIAT", carbones automotrices).
  [/\bGATO\b|\bCAMILLA\b|TABLA RODANTE|\bTORRE (DE )?SOPORTE\b|\bBURRO\b/, AUTO_GATOS],
  [/\bLLAVE DE CRUZ\b|PURGADOR|ESTETOSCOPIO|ANILLAR PISTON|ANILLOS DE PISTON|\bZUNCHO\b|\bSUNCHO\b|\bCALIPER\b|DESMONTAR INTER|RECTIFICADOR DE CILINDRO|FUGA DE (RADIADOR|CILINDRO)|PUNTA DE FRENO|MEDIDOR (DE )?(COMPRES|PRESION DE CAU|ACEITE)|MEDIDOR .*COMBUSTIBLE|\bBUJIAS?\b.*(1\/2|3\/8|5\/8|CALIBRADOR)|CALIBRADOR DE BUJIAS|LLAVE P\/BUJIA|DADO (P\/)?BUJIA|RESORTE (DE )?VALV|ESMERIL P\/VALV|BRUNIDORA.*FRENO|BRUÑIDORA.*FRENO|REFRIGERACION AUTOMOTRIZ|BOMBA DE PIE|LLAVE PARA MOTORIZADO|CUERDA P\/REMOLQUE/, AUTO_HERRAMIENTAS],
  [/\bGRASERA\b|\bENGRASADORA\b|\bACEITERA\b|\bEMBUDOS?\b|PICO.*GRASERA|GRASERA.*PICO|MANGUERA PARA GRASERA|\bGRASERAS\b|BOMBA (P\/)?DIESEL|BOMBA MANUAL (TRANSF|PARA SUCCION)|BOMBA (EXTRACTORA|METALICA PARA TAMBOR)/, AUTO_LUBRICACION],
  [/CARGADOR (DE )?BATERIA(S)? (12V|PULSE|CD\d|CARGA LENTA)|CARGADOR BATERIA 12V|CARGADOR DE BATERIAS? \d+AMP|\bARRANCADOR\b/, AUTO_BATERIAS],
  [new RegExp(`^BOCINA P\\/(${AUTOS})|^BOCINA SOBREMEDIDA|CARBON AUTOMOTRIZ`), AUTO_REPUESTOS],

  // Hogar y jardín: equipos de jardín, sus repuestos, herramientas de jardín y artículos de la casa.
  [/\bNYLON\b.*DESMALEZADORA|ROLLO DE NYLON|PORTA ?NYLON|CUCHILLA.*DESMALEZADORA|CABEZAL.*(DESMALEZADORA|NYLON)|^(\S+ )?NYLON (P\/|PARA|CUADRADO|REDONDO|TRENZADO|\d)/, JARDIN_REPUESTOS],
  [/\bDESMALEZADORA\b|\bCORTASETOS\b|CORTA SETOS|\bMOTOSIERRA\b|\bFUMIGADORA\b|\bASPERJADORA\b|\bSOPLADORA?\b|\bMOTOCULTOR\b|\bPODADORA\b|\bCORTAGRAMA\b|\bCORTADORA DE GRAMA/, JARDIN_EQUIPOS],
  [/\bRASTRILLO\b|\bESCARDILLA\b|\bCHICURA\b|\bMACHETE\b|\bHACHA\b|TIJERA.*(PODAR|JARDIN|PODA\b|SETO|FLORICULTURA)|SERRUCHO (DE )?PODAR|ESCOBA.*JARD|\bPALITA\b|PALA DE MANO|KIT DE JARDIN|\bPALIN\b|\bAZADON\b|\bGARABATO\b|\bCOA\b|CABO (GRUESO\/FINO )?PARA (RASTRILLO|CHICURA|ESCARDILLA|HACHA)|CABO GRUESO\/FINO PARA RASTRILLO|\bPALMA REAL\b/, JARDIN_HERRAMIENTAS],
  [/BALANZA.*(BANO|BAÑO|COCINA)|TERMOMETRO CORPORAL|SELLADORA DE BOLSAS|\bEUREKA\b/, HOGAR],

  // Tornillería: pasadores, chavetas, cupillas, remaches, clavos.
  [/\bPASADOR\b|\bCUPILLA\b|\bCHAVETA\b|\bPASADORES\b/, TORN_PASADORES],
  [/^(\S+ )?REMACHE\b|\bREMACHES\b/, TORN_REMACHES],
  [/\bCLAVO\b|\bCLAVOS\b/, TORN_CLAVOS],

  // Construcción: barras de silicón (el adhesivo de la pistola de silicón). Electricidad: piezas sueltas.
  [/BARRA DE SILICON|BARRAS DE SILICON|SILICON EN BARRA/, CONSTR_ADHESIVOS],
  [/MICRO SWICHE|KIT TERMORETRACTIL/, ELECTRICIDAD],

  // ===== dentro de Herramientas =====
  // Soldadura y oxicorte (antes que las manuales: "PINZA PORTA ELECTRODO", "MARTILLO P/SOLDADOR").
  [/MAQUINA (DE |P\/|PARA )?SOLDAR|MAQ\.? (DE |P\/)?SOLDAR|\bSOLDADORA\b|MOTOSOLDADOR|\bELECTRODOS?\b|PORTA ?ELECTRODO|PORTAELECTRODO|ALAMBRE (MIG|P\/SOLDAR|P\/ALUMINIO)|\bER4043\b|ROLLO ALAMBRE P\/SOLDAR|\bESTANO\b|\bESTAÑO\b|PASTA (PARA |P\/)SOLDAR|\bCAUTIN\b|\bDESOLDADOR\b|ESTACION (DE )?(SOLDA|TRABAJO)|\bSOPLETE\b|\bANTORCHA\b|OXICORTE|\bACETILENO\b|\bOXIGENO\b|PICO (P\/|PARA )(CORTAR|CORTE|SOLDAR)|\bYESQUERO\b|\bBORAX\b|\bFUNDENTE\b|REGULADOR (DE |P\/|PARA )?(ACETILENO|OXIGENO)|REGULADOR D\/ACETILENO|REGULADOR CON FLUJOMETRO|\bBOMBONA\b|\bADITAMENTO\b|LIMPIADOR (DE )?(BOQUILLA|PICO)|\b6010\b|\b6011\b|\b6013\b|\b7018\b|\bCARETA\b|GRAPA PARA SOLDAR PLASTICO|\bMECO\b|\bPLASMA\b|ELECTROPUNTO|VARILLA (PLATA|DE BRONCE)|PINZA (PARA |P\/)?TIERRA|EMPALME .*CABLE SOLD|(MARTILLO|PIQUETA) (P\/|PARA )SOLDADOR|\bUNIWELD\b|SOLDADOR INVERTER/, herr(H.soldadura)],

  // Medición y neumáticas que empiezan como una herramienta de mano ("PINZA DIGITAL", "DESTORNILLADOR NEUMATICO").
  [/\bMULTIMETRO\b|\bDETECTOR\b|\bPROBADOR\b|\bTESTER\b|PINZA DIGITAL|MEDIDOR DE PINZA|AMPERIM/, herr(H.medicion)],
  [/\bNEUMATIC|(PARA|P\/) COMPRESOR/, herr(H.aire)],

  // Herramientas manuales por su tipo (ver TIPO_MANUAL).
  [MANUAL, herr(H.manuales)],

  // Aire comprimido: compresores, sus partes y accesorios; herramientas y conexiones neumáticas.
  [/\bCOMPRESOR\b|UNIDAD SOBRE BANCADA|\bPRESTOLOOK\b|ACOPLE RAPIDO|\bACOPLE\b|\bACOPLADOR\b|\bCOILHOSE\b|MANGUERA (P\/|PARA )?(AIRE|COMPRESOR)|ROLLO MANGUERA .*COMPRESOR|FILTRO (DE )?(LINEA|ASPIRACION|REGULADOR)|MINI ?FIILTRO|MINI ?FILTRO DE AIRE|REGULADOR (DE )?(PRESION )?DE AIRE|MINI ?REGULADOR|MINIREGULADOR|VALVULA CHECK|VALVULA D\/SEGUR|ACEITE PARA COMPRESOR|PISTOLA (P\/|PARA )?(PINTAR|LAVAR|SOPLETEAR|SOPLAR|SANDBLAST|DE GRAVEDAD|GRAVEDAD)|PISTOLA (ROCIADORA|PINTAR|PROFESIONAL)|PISTOLA DE AIRE|PISTOLAS? NEUM|KIT (DE )?PISTOLAS|\bPIKAZO\b|PICO (DOBLE )?AIRE|\bINFLADOR\b|MEDIDOR (DE )?AIRE|TERMINAL CHICAGO|MACHO CHICAGO|LLAVE (DE )?IMPACTO NEUM|\bNEUMATIC|CODO BRONCE .*COMPRESOR|\bVOYLET\b|\bGAV\b|\bEURO REGULADOR/, herr(H.aire)],

  // Baterías y cargadores para herramientas inalámbricas.
  [/BATERIA (DE )?LITIO|CARGADOR (RAPIDO|RAP)|CARGADOR (DE )?BATERIA (18V|20V|12V LITIO)|CARGADOR BATERIA 18V|CARGADOR DE BATERIA AA/, herr(H.baterias)],

  // Repuestos industriales: correas, poleas, rolineras, chumaceras, retenes, resortes, bocinas (bujes).
  [/\bCORREA\b|\bPOLEA\b|\bROLDANA\b|\bROLINERA\b|\bCHUMACERA\b|\bRETEN\b|\b47[12]-\d|\b6799-\d|\bRESORTE\b|^BOCINA\b|\bBOCINA P\/|\bRODAMIENTO\b|\bCARDAN\b(?!.*(1\/2|3\/8|1\/4))|\bEBERLE\b|\bMOTOR \S+ (MONOFASICO|TRIFASICO)/, herr(H.industriales)],

  // Repuestos para herramientas: carbones (escobillas), filtros y piezas de equipos.
  [/\bCARBON\b|ESCOBILLA DE CARBON|REPUESTO ESCOBILLA|FILTRO (EXTERNO|P\/ASPIRADORA|PARA ASPIRADORA|P\/PISTOLA)|RESISTENCIA P\/SELLADORA|REPUESTO PARA PISTOLA|REPUESTO PARA PULIDOR|MANGUERA P\/HIDROLIMPIADORA|PISTOLA P\/HIDROLIMPIADORA|BARRA P\/PISTOLA HIDROJET|FITING HIDROJET|\bSWITCHE\b|\bINTERRUPTOR\b|\bINDUCIDO\b|\bCAMPO\b P\/|MANDRIL (DE )?REPUESTO|REPUES\.? ?CUCHILLA CORTA TUBO|LLAVE (P\/|PARA )MANDRIL|\bLLAVE MANDRIL\b/, herr(H.repuestos)],

  // Accesorios para herramientas: mechas, discos, puntas, hojas, piedras, copas, fresas, cepillos para máquina.
  [/\bMECHAS?\b|\bBROCAS?\b|\bDISCOS?\b|FIBRADISCOS?|\bPUNTAS?\b(?!.*(TESTER|MULTIMETRO))|\bHOJA\b|\bHOJILLA\b|\bPIEDRA\b|\bCOPA\b|\bFRESAS?\b|\bPLATO\b|\bLIJAS?\b|\bALMOHADILLA\b|\bPAD\b|\bMOPA\b|PORTA PUNTA|PORTAPUNTA|\bMANDRIL\b|ADAPTADOR SDS|ADAPTADOR DE TALADRO|EXTENSION FLEXIBLE|CEPILLO (CIRCULAR|COPA|T\/COPA|T\/BROCHA|DE COPA|CON ESPIGA|PLANO C\/ESPIGA|DE ACERO INOX|DE LATON)|CEPILLO CIRCULAR|DREMEL (CEPILLO|KIT)|KIT (DE )?(DISCOS|FRESAS|MECHAS|PARA LIJAR)|SET (DE )?(PIEDRA|FRESAS|MECHA)|JUEGO (DE )?(MECHAS?|BROCAS?|PUNTAS|DISCOS|FRESAS)|JGO\.? (DE )?(MECHAS?|BROCAS?|PUNTAS|DISCOS)|\bGRAPAS?\b|CAJA DE GRAPA|\bFULMINANTE\b|SIERRA COPA|\bCUCHILLA (P\/|PARA )?(CEPILLO|CANTEADORA)|REPUESTO (P\/ )?(CUCHILLA|EXACTO)|REPUESTO EXACTO|CUCHILLA REPUESTO|REPUESTO ARCO DE SEGUETA|\bSEGUETA\b(?!.*ARCO)|\bESPIGA\b|PIEDRA P\/AMOLAR/, herr(H.accesorios)],

  // Medición.
  [/CINTA METRICA|CINT\.MET|CINTA (TOPOGRAFO|C\/GANCHO)|\bNIVEL\b|\bESCUADRA\b|\bMULTIMETRO\b|\bTESTER\b|\bPROBADOR\b|\bVERNIER\b|\bCALIBRADOR\b(?!.*(BUJIA|CADENA))|\bBALANZA\b|\bPESA\b|\bDETECTOR\b|\bMANOMETROS?\b|\bTERMOMETRO\b|\bODOMETRO\b|\bPLOMADAS?\b|TIRA-?LINEAS?|TIRALINEAS|\bREGLA\b|\bTORQUI?METRO\b|TORQUÍMETRO|\bMEGGER\b|\bMEDIDOR\b|\bMEDIDO\b|\bUNI-?T\b|\bINSIZE\b|PINZA AMPERIM|AMPERIMETRICA|FALSA ESCUADRA|\bCOMPAS\b|\bTIZA\b|LAPIZ (DE )?CARPINTERO|\bLUXOMETRO\b|\bLASER\b|REGULADOR INDUSTRIAL/, herr(H.medicion)],

  // Metalmecánica: machos, tarrajas, roscado.
  [/\bMACHOS?\b|\bTARRAJA\b|\bROSCADORA\b|REPARADOR DE ROSCA|\bCONO\b|\bESCARIADOR\b|\bGIRA ?MACHO\b|\bTERRAJA\b|DADO PARA TARRAJA/, herr(H.metalmecanica)],

  // Elevación y amarre.
  [/\bSENORITA\b|\bSEÑORITA\b|\bESLINGA\b|\bCINCHA\b|\bZINCHA\b|\bFLEJE\b|\bFLEJADORA\b|\bTROLLEY\b|\bTECLE\b|\bPOLIPASTO\b|\bTRASPALETA\b|\bGRUA\b|\bSUJETADOR\b|CUERDA SUJETA|\bTENSOR\b|\bCADENA\b(?!.*(MOTOSIERRA|P\/))/, herr(H.elevacion)],

  // Cajas y organizadores.
  [/CAJA (DE |P\/|PARA |PLASTICA P\/)?HERRAM|CAJA PLASTICA P\/HERRAM|CAJA HERRAMIENTA|\bMALETIN\b|\bORGANIZADOR\b|\bTABLERO\b|CARRO (DE |P\/)?HERRAM|PORTA HERRAMIENTA|\bCINTURON\b|\bBOLSO\b|\bMORRAL\b/, herr(H.cajas)],

  // Herramientas a combustión (y equipos de obra a motor).
  [/\bGENERADOR\b|GASOL|COMBUSTION|\bDIESEL\b|\bBUJIA\b/, herr(H.combustion)],

  // Herramientas eléctricas (las máquinas).
  [/\bTALADRO\b|\bROTOMARTILLO\b|\bESMERIL\b|\bLIJADORA\b|\bSIERRA\b|\bCALADORA\b|\bINGLETEADORA\b|\bTRONZADORA\b|\bPULIDORA\b|\bPULIDOR\b|PISTOLA (DE )?(CALOR|AIRE CALIENTE)|\bATORNILLADOR\b|\bFRESADORA\b|\bFRESADOR\b|\bROUTER\b|\bTROMPO\b|\bRUTEADORA\b|\bHIDROJET\b|\bMEZCLADORA\b|\bASPIRADORA\b|\bHIDROLAVADORA\b|\bHIDROLIMP|\bDEMOLEDOR\b|MARTILLO (DEMOLEDOR|PERCUTOR|ELECTRICO)|\bMULTIHERRAMIENTAS?\b|\bMULTIHERRAMIENT\b|\bBATIDOR\b|\bMEZCLADOR\b|\bCORTADORA\b|\bSELLADORA\b|\bCEPILLO ELECTRICO\b|\bBRUNIDORA\b|\bBRUÑIDORA\b|\bLLAVE (DE )?IMPACTO\b|\bAMOLADORA\b|\bRANURADORA\b|\bCANTEADORA\b|\bENGRAPADORA ELECTRICA\b|\bSOLDADOR\b|INALAMBRIC|\b\d+W\b|\b\d+V\b(?!.*(BATERIA|CARGADOR))|\bWATTS?\b/, herr(H.electricas)],
];

/** Subcategorías de Saint → la de la web (cuando ninguna regla aplica). */
const SUBCATEGORIA_SAINT: Record<string, string> = {
  "Herramientas eléctricas": H.electricas,
  "Herramientas manuales": H.manuales,
  "Herramientas de medición": H.medicion,
  "Herramientas neumáticas": H.aire,
  "Herramientas a combustión": H.combustion,
  "Herramientas de oxicorte": H.soldadura,
  "Herramientas metalmecánicas": H.metalmecanica,
  "Herramientas hidráulicas": H.manuales,
  "Herramientas automotrices": AUTO_HERRAMIENTAS.subcategoria,
};

/** "Ñ" se queda; las demás tildes se quitan; todo en mayúsculas y con un solo espacio. */
export const normalizarNombre = (nombre: string) =>
  nombre
    .toUpperCase()
    .replace(/Ñ/g, "\u0000")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0000/g, "Ñ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Categoría y subcategoría de un producto de Saint. Hoy solo se reclasifica lo que llega de Herramientas: los productos
 * de otras categorías conservan las suyas.
 */
export function reclasificar(p: { nombre: string; categoriaSlug: string; subcategoria: string | null }): Destino {
  const actual: Destino = { categoria: p.categoriaSlug, subcategoria: p.subcategoria ?? "Otros" };
  if (p.categoriaSlug !== "herramientas") return actual;
  const n = normalizarNombre(p.nombre);
  for (const [patron, destino] of REGLAS) if (patron.test(n)) return destino;
  // Sin regla: su subcategoría de Saint, con el nombre de la web. Lo que Saint llamaba "automotrices" va a Vehículos.
  const sub = SUBCATEGORIA_SAINT[actual.subcategoria] ?? H.manuales;
  if (sub === AUTO_HERRAMIENTAS.subcategoria) return AUTO_HERRAMIENTAS;
  // "Herramientas eléctricas" de Saint sin regla de máquina: casi todo es accesorio o repuesto; se revisa en las pruebas.
  return herr(sub);
}
