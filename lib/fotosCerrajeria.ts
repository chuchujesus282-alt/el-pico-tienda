// Fotos de los productos de Cerrajería, hechas por el dueño (originales en su PC, una por tipo de pieza). Funciona igual
// que lib/fotosTornilleria.ts: cada regla lee el nombre de Saint, sin medidas, y lo que no calza con ninguna queda sin foto
// A PROPÓSITO. La foto no mueve el producto de categoría: eso lo decide Saint. Solo aplica a Cerrajería para no tocar otra
// categoría por un nombre parecido. Las reglas se prueban en orden: la más específica va primero.
// Las fotos con una marca a la vista (Lobster, Visalock, RUN, Cisa…) solo van en productos de esa marca.
// Lo usa lib/agrupaciones.ts.

const CARPETA = "/productos/cerrajeria/";

const REGLAS: [RegExp, string][] = [
  // ---- Accesorios
  [/^CAJA LLAVE 60\b/, "caja-llave-60-llaves-y-llaveros"],
  [/^EPOTMETAL CAJA LLAVE 20\b/, "epotmetal-caja-llave-20-llaves-y-llaver"],
  [/^EPOTMETAL CAJA LLAVE 48-45\b/, "epotmetal-caja-llave-48-45-llaves"],
  [/^LLAVEROS PLASTICOS\b/, "llaveros-plasticos-marca-llave"],
  [/^MARCADOR DE GOMA\b/, "marcador-de-goma-para-llave-12-pzas"],
  [/^MAQUINA PARA COPIAR LLAVES\b/, "maquina-para-copiar-llaves-110v"],

  // ---- Cajas fuertes y candados
  [/^EXXEL CAJA FUERTE DIGITAL\b/, "exxel-caja-fuerte-digital-yl17"],
  [/^VISALOCK CAJA FUERTE RECTANGULAR\b/, "visalock-caja-fuerte-rectangular-hammer"],
  [/^OREJA P\/CANDADO\b/, "oreja-para-candado"],
  [/^ALDABA .*P\/CANDADO\b/, "aldaba-para-candado"],
  [/^CANDADO CON COMBINACION\b/, "candado-con-combinacion-para-maleta"],
  [/^LOBSTER CANDADO .*BARRILITO\b/, "candado-barrilito"],
  [/^VISALOCK CANDADO .*ACERO LAMINADO\b/, "visalock-candado-acero-laminado"],
  [/^(VIRO )?(CISA )?CANDADO .*ANTICIZA/, "candado-anticizalla"],
  [/^(VISALOCK )?CANDADO .*ARCO LARGO\b/, "candado-arco-largo"],
  [/\bCANDADO .*(LATON|MARINO|CLASS SKIN|ROMA|BRONCE)\b/, "candado-laton"],

  // ---- Cerraduras de baños y dormitorios
  [/^RUN CERRADURA MANILLA NEGRO\b/, "cerradura-manilla-negro-mate-con-llave"],
  [/^(SIRPOR|VISALOCK) CERRADURA MANILLA\b/, "cerradura-con-manilla"],
  [/^CERRADURA C\/MANILLA\b/, "cerradura-con-manilla"],
  [/^(SIRPOR |VISALOCK |VISALOCK\/GEO )?(CERRADURA )?(DE )?POMO\b.*(TUBULAR|PISTILLO|PRINCIPAL|SAT|LLAVE|ECONOMICA)/, "cerradura-de-pomo"],

  // ---- Cerraduras de seguridad, eléctricas, de embutir y de sobreponer
  [/^CISA CERRADURA PARA SANTA MARIA\b/, "cerradura-para-santa-maria"],
  [/^SIRPOR CERROJO CUADRADO\b/, "cerrojo-cuadrado-llav-bot"],
  [/^VISALOCK CERROJO LLAVE\/LLAVE\b/, "cerrojo-llave-llave"],
  [/^VISALOCK\/SECURITY CERROJO LLAVE\/MARIPOSA\b/, "cerrojo-llave-mariposa"],
  [/\bHEMBRILLA ELEC/, "hembrilla-electrica"],
  [/^CISA CERRADURA GANCHO\b/, "cisa-cerradura-gancho"],
  [/^CERRADURA EMBUTIR\b/, "cerradura-embutir"],
  [/^(CISA|VISALOCK) CERRADURA 83 DE\b/, "cerradura-embutir"],
  [/^CISA CERRADURA EMBUTIR\b/, "cerradura-embutir"],
  [/^CISA CERRADURA SEGU\b/, "cerradura-embutir"],
  [/^(CISA )?CERRADURA SOBREP/, "cerradura-sobreponer"],

  // ---- Cerraduras para mueble
  [/^CERRADURA LATERAL C\/BARRA\b/, "cerradura-lateral-cbarra-parchivo"],
  [/^CERRADURA PULSANTE\b/, "cerradura-pulsante"],
  [/^GATER CERRADURA CONEJITO\b/, "cerradura-conejito"],
  [/^EXXEL CERRADURA PESTILLO ROTATIVO\b/, "cerradura-pestillo-rotativo"],

  // ---- Cilindros
  [/\bCILINDRO SUELTO\b/, "cilindro-suelto"],
  [/\bCILINDRO .*(LLAVE\/BOTON|LLAVE\/POMO)\b/, "cilindro-seguridad-llave-boton"],
  [/^(CISA )?CILINDRO (\d+MM )?PERA\b/, "cilindro-pera"],
  [/^VISALOCK CILINDRO ASTRAL\b/, "cilindro-pera"],

  // ---- Bisagras para muebles e imanes
  [/^BISAGRA (EMBUTIR P\/COCINA|P\/GABINETE)\b/, "bisagra-embutir-para-cocina"],
  [/^IMAN \d+KG\b/, "iman-economico"],
  [/^SOPORTE-BRAZO HIDRAULICO\b/, "soporte-brazo-hidraulico"],

  // ---- Correderas y guías
  [/^CORREDERA FGV\b/, "corredera-fgv-para-gaveta"],
  [/^CORREDERA TELESCOPICA .*CON FRENO\b/, "corredera-telescopica-con-freno"],
  [/^CORREDERA TELESCOPICA\b/, "corredera-telescopica-sin-freno"],
  [/^GUIA DE METAL\b/, "guia-de-metal-para-puerta-de-closet"],
  [/^GUIA DE PLASTICO\b/, "guia-de-plastico-para-puerta-de-closet"],

  // ---- Deslizadores y ruedas
  [/^CAMSCO FINAL DE CARRERA\b/, "camsco-final-de-carrera-crueda"],
  [/^DESLIZADOR C\/CLAVO\b/, "deslizador-con-clavo-y-goma"],
  [/^DESLIZADOR PLASTICO GRANDE\b/, "deslizador-plastico-grande"],
  [/^PLATO GIRATORIO\b/, "plato-giratorio-para-muebles-metal"],
  [/^RUEDA DE NYLON FIJA .*BLANCA\b/, "rueda-de-nylon-fija-blanca"],
  [/^RUEDA DE NYLON FIJA .*NARANJA\b/, "rueda-de-nylon-fija-naranja"],
  [/^RUEDA (DE )?NYLON GIRATORIA .*BLANCA\b/, "rueda-de-nylon-giratoria-blanca"],
  [/^RUEDA (DE )?NYLON GIRATORIA .*C\/FRENO\b/, "rueda-de-nylon-giratoria-naranja-con-freno"],
  [/^RUEDA (DE )?NYLON GIRATORIA .*NARANJA\b/, "rueda-de-nylon-giratoria-naranja"],
  [/^RUEDA D\/PLASTICO .*P\/OFICINA\b/, "rueda-de-plastico-para-oficina"],
  [/^RUEDA GOMA CON ESPIGA\b/, "rueda-goma-con-espiga"],
  [/^RUEDA B\/HIERRO GOMA POLIURETAN/, "rueda-hierro-goma-poliuretan"],
  [/^(CONTINENTAL RUEDA|RUEDA CONTINENTAL|TOLSEN RUEDA POLIURET\S*) .*(CON FRENO|C\/FRENO)\b/, "rueda-giratoria-con-freno"],
  [/^(CONTINENTAL RUEDA|RUEDA CONTINENTAL|TOLSEN RUEDA POLIURET\S*) .*GIRAT/, "rueda-giratoria"],
  [/^(CONTINENTAL RUEDA|RUEDA CONTINENTAL|TOLSEN RUEDA POLIURET\S*) .*FIJA\b/, "rueda-fija"],
  [/^RUEDA POLIURETANO FIJA\b/, "rueda-fija"],
  [/^RUEDA DE GOMA(\/PLAS)? CON BASE\b/, "rueda-giratoria"],
  [/^CONTINENTAL RUEDA SUELTA\b/, "rueda-suelta"],

  // ---- Niveladores
  [/^ESPARRAGO PATA MUEBLE\b/, "esparrago-pata-mueble"],
  [/^NIVELADOR PEQUENO\b/, "nivelador-pequeno-con-pata-plastica"],
  [/^PATA CONICA\/CILINDRICA\b/, "pata-conica-cilindrica-con-nivelador"],
  [/^POLIGUM NIVELADOR\b/, "poligum-nivelador-plastico-con-base"],

  // ---- Soportes (la línea Aerocloset lleva el logo de la marca)
  [/^AERO(CLOSET|SOPORTE)\b/, "aerocloset"],
  [/^ANGULO CANTO P\/CARPINTERO\b/, "angulo-canto-para-carpintero"],
  [/^ANGULO P\/CARPINTERO PLANO\b/, "angulo-para-carpintero-plano"],
  [/^JUEGO DE GANCHOS? (PARA |P\/)CAMA\b/, "juego-de-gancho-para-cama-tangulo"],
  [/^PIE AMIGO P\/CREMALLERA\b/, "pie-amigo-para-cremallera"],
  [/^PIE DE AMIGO PLEGABLE\b/, "pie-de-amigo-plegable"],
  [/^PIE DE AMIGO\b/, "pie-de-amigo"],
  [/^SOPORTE ENTREPANOS PLASTICO\b/, "soporte-entrepanos-plastico"],

  // ---- Bisagras para puertas
  [/^BISAGRA (DE )?ACERO INOX .*SIN ROLINERA\b/, "bisagra-acero-inox-sin-rolinera"],
  [/^BISAGRA (DE )?ACERO INOX\b/, "bisagra-cromada-con-rolineras"],
  [/^BISAGRA INOX .*CON ROLINERA\b/, "bisagra-cromada-con-rolineras"],
  [/^BISAGRA (3-1\/2" |HIERRO )CROMAD[AO]\b/, "bisagra-cromada-con-rolineras"],
  [/^BISAGRA ARMILLAR\b/, "bisagra-armillar-de-hierro"],
  [/^BISAGRA BRONCE .*C\/ROLINERA\b/, "bisagra-bronce-con-rolinera"],
  [/^BISAGRA COLONIAL\b/, "bisagra-colonial-izq-der-bronce"],
  [/^BISAGRA (DE H\. GALV AMARILLA|HIERRO ZINC AMAR)/, "bisagra-hierro-zinc-amar"],
  [/^BISAGRA (DE )?HIERRO LATONA/, "bisagra-de-hierro-latonado"],
  [/^BISAGRA (H\.|HIERRO )ZINCADO\b/, "bisagra-hierro-zincado"],
  [/^BISAGRA DE PIANO\b/, "bisagra-de-piano"],
  [/^BISAGRA ALUMINIO .*SOBREPONER\b/, "bisagra-de-sobreponer"],
  [/^BISAGRA INVISIBLE\b/, "bisagra-invisible"],
  [/^BISAGRA (MINI LIBRO|TIPO LIBRITO)\b/, "bisagra-mini-libro"],
  [/^BISAGRA PARA CAVA\b/, "bisagra-para-cava"],
  [/^BISAGRA PISTON\b/, "bisagra-piston-de-hierro"],
  [/^BISAGRA VAI-VEN (DORADA|RESORTE)/, "bisagra-vai-ven"],
  [/^BISAGRA VIDRIO TIPO U\b/, "bisagra-vidrio-tipo-u"],
  [/\bCIERRA PUERTA\b/, "cierrapuertas"],

  // ---- Manillas y pomos
  [/^MANILLA PLA ALUM FIJ\/FIJ BLANCA\b/, "manilla-pla-alum-fij-fij-blanca"],
  [/^MANILLA PLA ALUM FIJ\/FIJ NEGRA\b/, "manilla-pla-alum-fij-fij-negra"],
  [/^MANILLA PLA ALUM FIJ\/FIJ\b/, "manilla-pla-alum-fij-fij"],
  [/^MANILLA PLA ALUM FIJ\/MOV BLANCA\b/, "manilla-pla-alum-fij-mov-blanca"],
  [/^MANILLA PLA ALUM FIJ\/MOV ORO\b/, "manilla-pla-alum-fij-mov-oro"],
  [/^MANILLA PLA ALUM MOV\/MOV BLANCA\b/, "manilla-pla-alum-mov-mov-blanca"],
  [/^MANILLA PLA ALUM MOV\/MOV ORO\b/, "manilla-pla-alum-mov-mov-oro"],
  [/^MANILLA (PLA ALUM (FIJ\/MOV|MOV\/MOV)|ALUMINIO PLACA)/, "manilla-pla-alum-fij-mov"],
  [/^MANILLAS CAMPANA\b/, "manillas-campana"],
  [/^POMO ALUMINIO\b/, "pomo-aluminio"],
  [/^POMO MAD PLA H\. CROM\b/, "pomo-mad-pla-h-crom-fijmov"],
  [/^POMO MAD\. C\/PLA BRONCE\b/, "pomo-mad-cpla-bronce-fijmov"],
  [/^(SIRPOR MANILLA TUBULAR|VISALOCK MANILLA INOX)\b/, "manilla-tubular"],
  [/^MANILLAS AGUEDA\b/, "manillas-agueda"],
  [/^CISA MANILLON HORIZ\b/, "manillon-horiz-serie-europa"],
  [/^OJO MAGICO\b/, "ojo-magico"],
  [/^PARABICHO\b/, "parabicho-metalico-de-aluminio"],

  // ---- Pasadores y tiradores
  [/^CERROJO PARA PUERTA\b/, "cerrojo-para-puerta"],
  [/^GANCHO D\/CADENA C\/PASADOR\b/, "gancho-dcadena-cpasador"],
  [/^MANILLA CROMADA\b/, "manilla-cromada"],
  [/^MANILLA DE BRONCE\b/, "manilla-de-bronce"],
  [/^PASADOR ALUMINIO BRONCE\b/, "pasador-de-bronce"],
  [/^PASADOR ALUMINIO\b/, "pasador-aluminio"],
  [/^PASADOR GIRATORIO\b/, "pasador-giratorio"],
  [/^PASADOR PARA EMBUTIR DE UNA HZA\b/, "pasador-para-embutir-de-una-hza"],
  [/^PASADOR PORTA CANDADO\b/, "pasador-porta-candado"],
  [/^AGUEDA TRANCADOR PARA VENTANA\b/, "trancador-para-ventana"],
  [/^TIRADOR PLASTICO ASA\b/, "tirador-plastico"],
  [/^TIRADOR(?! (CONCHA|CROMADO BOTON|PLASTICO HONGO))\b/, "tirador"],

  // ---- Topes
  [/^(CUÑA DE GOMA|JUEGO DE 4 CUÑA)\b/, "cuna-de-goma-para-puerta"],
  [/^TOPE DE GOMA P\/BASTON\b/, "tope-de-goma-para-baston"],
  [/^TOPE DE GOMA\b/, "tope-de-goma-grande"],
  [/^TOPE ESCRITORIO\b/, "tope-escritorio"],
  [/^(TOPE PARA PUERTA DE PISO|UYUSTOOLS TOPE DE PUERTA)\b/, "tope-para-puerta-de-piso"],
  [/^TOPE PARA PUERTA 1\/2 LUNA\b/, "tope-para-puerta-media-luna"],
  [/^TOPE P\/VENTANA PANORAMICA\b/, "tope-pventana-panoramica"],
];

/** Todos los archivos que usan las reglas (para la prueba que revisa que cada uno exista). */
export const ARCHIVOS_CERRAJERIA = [...new Set(REGLAS.map(([, archivo]) => archivo))];

/** Foto del producto de Cerrajería según su nombre de Saint, o undefined si no tiene (va sin foto). */
export function fotoCerrajeria(nombre: string, categoriaSlug: string): string | undefined {
  if (categoriaSlug !== "cerrajeria") return undefined;
  const n = nombre.trim().replace(/\s+/g, " ").toUpperCase();
  const regla = REGLAS.find(([patron]) => patron.test(n));
  return regla ? `${CARPETA}${regla[1]}.webp` : undefined;
}
