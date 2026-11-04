// Fotos de los productos de Tornillería, hechas por el dueño (originales en su PC, una por tipo de pieza). Cada regla lee
// el nombre de Saint, sin medidas: así un producto nuevo de un tipo ya fotografiado sale con foto sin tocar nada, y los
// escritos distinto pero iguales ("ARANDELA 10MM COBRE…", "CEXPROM ARANDELA COBRE 1/2") comparten la misma.
// Lo que no calza con ninguna regla queda sin foto A PROPÓSITO: no se generaron todas. La foto no mueve el producto de
// categoría: eso lo decide Saint. Solo aplica a Tornillería para no tocar otra categoría por un nombre parecido.
// Las reglas se prueban en orden: la más específica va primero. Lo usa lib/agrupaciones.ts.

const CARPETA = "/productos/tornilleria/";

const REGLAS: [RegExp, string][] = [
  // ---- Arandelas y orrines
  [/^ARANDELA ASFALTICAS\b/, "arandela-asfalticas-para-gancho-de-techo"],
  [/^(CEXPROM )?ARANDELA\b.*\bCOBRE\b/, "arandela-cobre"],
  [/^ARANDELA ESTRELLA EXTERNA\b/, "arandela-estrella-externa"],
  [/^ARANDELA ESTRELLA INTERNA\b/, "arandela-estrella-interna"],
  [/^ARANDELA NEOPRENO\b/, "arandela-neopreno"],
  [/^ARANDELA PARA GANCHO DE TECHO\b/, "arandela-para-gancho-de-techo"],
  [/^ARANDELA PLANA INOX\b/, "arandela-plana-inox"],
  [/^ARANDELA PLANA\b/, "arandela-plana"],
  [/^ARANDELA PRESION INOX\b/, "arandela-presion-inox"],
  [/^ARANDELA PRESION\b/, "arandela-presion"],
  [/^DYLLU SET DE ORRINES\b/, "dyllu-set-de-orrines-125pzas"],
  [/^ORRIN\b/, "orrin-arosellos"], // "ORRIN / AROSELLOS 1/2" y "ORRIN P203 5/16 X 1/8"

  // ---- Tuercas
  [/^TUERCA .*NC PARA GANCHO DE TECHO\b/, "tuerca-nc-para-gancho-de-techo"],
  [/^TUERCA ANCLAJE 3 PUNTAS/, "tuerca-anclaje-3-puntas"],
  [/^TUERCA ANCLAJE 4 PUNTAS/, "tuerca-anclaje-4-puntas"],
  [/^TUERCA AUTOROSCANTE\b/, "tuerca-autoroscante"],
  [/^TUERCA CIEGA\b/, "tuerca-ciega"], // también la inox y la galvanizada
  [/^TUERCA CUADRADA\b/, "tuerca-cuadrada-metal"],
  [/^TUERCA DESAGUE D\/FREGADERO\b/, "tuerca-desague-de-fregadero"],
  [/^TUERCA FLARE INV\. 41W\b/, "tuerca-flare-inv-41w"],
  [/^TUERCA HEX BRONCE NC\b/, "tuerca-hex-bronce-nc"],
  [/^TUERCA HEX CLASE 6, DIN 934\b/, "tuerca-hex-clase-6-din-934"],
  [/^TUERCA HEX CLASE 8, DIN 934\b/, "tuerca-hex-clase-8-din-934"],
  [/^TUERCA HEX G2NC\b/, "tuerca-hex-g2nc"],
  [/^TUERCA HEX G5NC\b/, "tuerca-hex-g5nc"],
  [/^TUERCA HEX G5NF\b/, "tuerca-hex-g5nf"],
  [/^TUERCA HEX INOX\b/, "tuerca-hex-inox"],
  [/^TUERCA HEX METAL NC\b/, "tuerca-hex-metal-nc"],
  [/^TUERCA MARIPOSA CHAPA\b/, "tuerca-mariposa-chapa"],
  [/^TUERCA MARIPOSA SOLIDA\b/, "tuerca-mariposa-solida"],
  [/^TUERCA PARA RABO COCHINO\b/, "tuerca-para-rabo-cochino"],
  [/^TUERCA SEGURIDAD DIN 985\b/, "tuerca-seguridad-din-985"],
  [/^TUERCA SEGURIDAD NC\b/, "tuerca-seguridad-nc"],
  [/^TUERCA SEGURIDAD NF\b/, "tuerca-seguridad-nf"], // también la inox

  // ---- Fijación de pared
  [/^ALCAYATA ABIERTA CON TORNILLO\b/, "alcayata-abierta-con-tornillo"],
  [/^ALCAYATA BRONCE ARGOLLA FIJA\b/, "alcayata-bronce-argolla-fija"],
  [/^ALCAYATA CERRADA CON TORNILLO\b/, "alcayata-cerrada-con-tornillo"],
  [/^ALCAYATA TIPO "L" ATORNILLABLE\b/, "alcayata-tipo-l-atornillable"],
  [/^GANCHO "J" P\/TECHO\b/, "gancho-j-ptecho"],
  [/^GANCHO "L" P\/TECHO\b/, "gancho-l-ptecho"],
  [/^INACO PITON CON TUERCA\b/, "inaco-piton-con-tuerca"],
  [/^PERNOS DE ANCLAJE\b/, "pernos-de-anclaje"],
  [/^RAMPLUG BUCHA INTE O PHILLIPS\b/, "ramplug-bucha-inte-o-phillips"],
  [/^RAMPLUG (DE BUCHA INTERNA O PHILLIPS|TIPO PHILLIS)\b/, "ramplug-de-bucha-interna-o-phillips"],
  [/^RAMPLUG P\/DRYWALL METALICO\b/, "ramplug-drywall-metalico"],
  [/^RAMPLUG P\/DRYWALL PLASTICO\b/, "ramplug-drywall-plastico"],
  [/^RAMPLUG DE HIERRO\b.*\bCON ARO ABIERTO\b/, "ramplug-de-hierro-con-aro-abierto"],
  [/^RAMPLUG DE HIERRO\b.*\bCON ARO CERRADO\b/, "ramplug-de-hierro-con-aro-cerrado"],
  [/^RAMPLUG DE HIERRO\b.*\bCON ARO\b/, "ramplug-de-hierro-con-aro"],
  [/^RAMPLUG DE HIERRO\b/, "ramplug-de-hierro"],
  [/^RAMPLUG MARIPOSA\b/, "ramplug-mariposa"],
  [/^RAMPLUG T\/MARIPOSA STRAP TOGGLER\b/, "ramplug-mariposa-strap-toggler"],
  [/^RAMPLUG PLASTICO SASPITO AZUL\b/, "ramplug-plastico-saspito-azul"],
  [/^RAMPLUG PLASTICO SASPITO GRIS\b/, "ramplug-plastico-saspito-gris"],
  [/^RAMPLUG PLASTICO SASPITO NARANJA\b/, "ramplug-plastico-saspito-naranja"],
  [/^RAMPLUG PLASTICO SASPITO VERDE\b/, "ramplug-plastico-saspito-verde"],
  [/^RAMPLUG PLASTICO AZUL\b/, "ramplug-plastico-azul"],
  [/^RAMPLUG PLASTICO BLANCO\b/, "ramplug-plastico-blanco"],
  [/^RAMPLUG PLASTICO GRIS\b/, "ramplug-plastico-gris"],
  [/^RAMPLUG PLASTICO NARANJA\b/, "ramplug-plastico-naranja"],
  [/^RAMPLUG PLASTICO ROJO\b/, "ramplug-plastico-rojo"],
  [/^RAMPLUG PLASTICO VERDE\b/, "ramplug-plastico-verde"],
  [/^RAMPLUG\b.*\bTIPO HILTI\b/, "ramplug-tipo-hilti"],

  // ---- Tornillos allen
  [/^TOR ALLEN CIL INOX DIN 912\b/, "tor-allen-cil-inox-din-912"],
  [/^TOR ALLEN CIL DIN 912\b/, "tor-allen-cil-din-912"],
  [/^TOR ALLEN CIL INOX\b/, "tor-allen-cil-inox"],
  [/^TOR ALLEN CIL NC\b/, "tor-allen-cil-nc"],
  [/^TOR ALLEN PLANA DIN 799\b/, "tor-allen-plana-din-799"],
  [/^TOR ALLEN PLANA NC\b/, "tor-allen-plana-nc"],

  // ---- Tornillos de cabeza pan, redonda y gota de sebo
  [/^TOR AUTO PAN PHS INOX\b/, "tor-auto-pan-phs-inox"],
  [/^TOR AUTO PAN PHS\b/, "tor-auto-pan-phs"],
  [/^TOR AUTO PAN ST\b/, "tor-auto-pan-st"],
  [/^TORNILLO AUTOTAL\b.*\bLENTEJA ZINC\b/, "tor-autotal-lenteja-zinc"],
  [/^TOR AUTOTAL PAN PHS\b/, "tor-autotal-pan-phs"],
  [/^TOR METAL P\/CAJETIN\b/, "tor-metal-para-cajetin"],
  [/^TOR METAL REDON INOX\b/, "tor-metal-redon-inox"],
  [/^TOR METAL REDON NC\b/, "tor-metal-redon-nc"],
  [/^TOR METAL GOTA\/SEBO\b/, "tor-metal-gotasebo"],

  // ---- Tornillos de cabeza plana
  [/^TOR AUTO PLANA PHS INOX\b/, "tor-auto-plana-phs-inox"],
  [/^TOR AUTO PLANA PHS\b/, "tor-auto-plana-phs"],
  [/^TOR AUTO PLANA ST\b/, "tor-auto-plana-st"],
  [/^TOR DRYWALL R\. ?GRUESA\b/, "tor-drywall-r-gruesa"],
  [/^TOR MADERA PLANA\b/, "tor-madera-plana"],
  [/^TOR METAL PLANA INOX\b/, "tor-metal-plana-inox"],
  [/^TOR METAL PLANA NC\b/, "tor-metal-plana-nc"],
  [/^TORNILLO PLYCEM\b.*\bC\/PUNTILLA\b/, "tornillo-plycem-puntilla"],

  // ---- Tornillos hexagonales y de carruaje
  [/^TOR HEX 8\.8, DIN 931\b/, "tornillos-hex-din-931"],
  [/^TOR HEX 8\.8, DIN 933\b/, "tornillos-hex-din-933"],
  [/^TOR HEX G2NC\b/, "tor-hex-g2nc"],
  [/^TOR HEX G5NC\b/, "tor-hex-g5nc"],
  [/^TOR HEX G5NF\b/, "tor-hex-g5nf"],
  [/^TOR HEX INOX\b/, "tor-hex-inox"],
  [/^TOR HEX TIRAFONDO\b/, "tor-hex-tirafondo"],
  [/^TOR AUTO HEX\b/, "tor-auto-hex"],
  [/^TOR AUTOTAL HEX\b/, "tor-autotal-hex"],
  [/^TOR BRONCE C\/HEX\/UNC\b/, "tor-bronce-hex"],
  [/^TOR PARACHOQUE\b/, "tor-parachoques"],
  [/^TOR CARRUAJE\b/, "tor-carruaje"],

  // ---- Varillas roscadas
  [/^BARRA ROSCADA\b.*\bGALV\b/, "barra-roscada-galv"],
  [/^ESPARRAGO\b/, "esparrago-g5nc-nf"], // G5NC -NF y NC -NC
  [/^PRISIONERO ALLEN INOX\b/, "prisionero-allen-inox"],
  [/^PRISIONERO ALLEN DIN 916\b/, "prisionero-allen-din-916"],
  [/^PRISIONERO ALLEN NC\b/, "prisionero-allen-nc"],
];

/** Todos los archivos que usan las reglas (para la prueba que revisa que cada uno exista). */
export const ARCHIVOS_TORNILLERIA = [...new Set(REGLAS.map(([, archivo]) => archivo))];

/** Foto del producto de Tornillería según su nombre de Saint, o undefined si no tiene (va sin foto). */
export function fotoTornilleria(nombre: string, categoriaSlug: string): string | undefined {
  if (categoriaSlug !== "tornilleria") return undefined;
  const n = nombre.trim().replace(/\s+/g, " ").toUpperCase();
  const regla = REGLAS.find(([patron]) => patron.test(n));
  return regla ? `${CARPETA}${regla[1]}.webp` : undefined;
}
