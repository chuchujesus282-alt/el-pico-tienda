// Constantes de las calculadoras de proyectos. TODO lo que un maestro de obra podría querer ajustar
// está aquí: presentaciones comerciales, dosificaciones, rendimientos y desperdicios.
// De dónde sale cada valor y un ejemplo resuelto: docs/FORMULAS.md.

/** Presentaciones comerciales (unidad de venta de cada material). */
export const PRESENTACION = {
  sacoCementoKg: 42.5,
  barraCabillaM: 6,
  rolloAlambreKg: 1,
  galonesPorCunete: 4, // la "paila" de pintura del catálogo trae 4 galones
  /** Si después de los cuñetes sobran estos galones o más, sale mejor llevar otro cuñete. */
  galonesSueltosQueConvieneCunete: 3,
  sacoPegoKg: 10,
  bolsaCaratoKg: 2,
  tornillosTechoPorBolsa: 100,
  tornillosDrywallPorCaja: 100,
  rolloMantoM2: 10,
  cuneteImpermeabilizanteL: 18.9, // cuñete de 5 galones
  rolloCintaJuntasM: 75,
  galonMasillaKg: 5,
} as const;

/** Desperdicio por material (0.05 = 5 %). */
export const DESPERDICIO = {
  bloques: 0.05,
  mortero: 0.1,
  concreto: 0.05,
  pintura: 0.05,
  ceramicaRecta: 0.1,
  ceramicaDiagonal: 0.15,
  pego: 0.05,
  carato: 0.1,
  laminasTecho: 0.05,
  tornillosTecho: 0.05,
  impermeabilizacion: 0.1,
  laminasDrywall: 0.1,
  rielesDrywall: 0.05,
} as const;

/** Bloques: medidas reales de la cara que se ve (largo × alto, en m) y junta de mortero. */
export const BLOQUES = {
  juntaM: 0.015,
  arcilla: { largoM: 0.3, altoM: 0.2 },
  concreto: { largoM: 0.39, altoM: 0.19 },
} as const;

/** Mortero: cemento (kg) y arena (m³) por cada m³ de mezcla, según la proporción cemento:arena. */
export const MORTERO = {
  "1:3": { cementoKg: 454, arenaM3: 1.09 },
  "1:4": { cementoKg: 364, arenaM3: 1.16 },
  "1:5": { cementoKg: 302, arenaM3: 1.2 },
} as const;
export type MezclaMortero = keyof typeof MORTERO;
export const MEZCLA_PEGA_BLOQUES: MezclaMortero = "1:4";

/** Concreto: materiales por m³ según la resistencia f'c (kg/cm²), con sacos de 42,5 kg. */
export const CONCRETO = {
  "140": { sacos: 7.01, arenaM3: 0.56, piedraM3: 0.57, aguaL: 184 },
  "175": { sacos: 8.43, arenaM3: 0.54, piedraM3: 0.55, aguaL: 185 },
  "210": { sacos: 9.73, arenaM3: 0.52, piedraM3: 0.53, aguaL: 186 },
  "245": { sacos: 11.5, arenaM3: 0.5, piedraM3: 0.51, aguaL: 187 },
  "280": { sacos: 13.34, arenaM3: 0.45, piedraM3: 0.51, aguaL: 189 },
} as const;
export type ResistenciaConcreto = keyof typeof CONCRETO;

/** Cabillas: diámetro (mm) y peso (kg por metro). El solape es de 40 veces el diámetro. */
export const CABILLAS = {
  "3/8": { diametroMm: 9.5, kgPorM: 0.559 },
  "1/2": { diametroMm: 12.7, kgPorM: 0.994 },
  "5/8": { diametroMm: 15.9, kgPorM: 1.554 },
} as const;
export type DiametroCabilla = keyof typeof CABILLAS;
export const SOLAPE_EN_DIAMETROS = 40;
/** Alambre de amarre: kg de alambre por cada kg de cabilla. */
export const ALAMBRE_KG_POR_KG_ACERO = 0.025;

/** Pintura: m² que cubre un galón en una mano. */
export const PINTURA = {
  rendimientoLisaM2: 40,
  rendimientoRugosaM2: 30,
  rendimientoSelladorM2: 35,
} as const;

/** Cerámica y porcelanato: m² por caja, pego por m² y datos de la junta para el carato. */
export const REVESTIMIENTOS = {
  ceramica: { m2PorCaja: 2.03, ladoMm: 450, espesorMm: 8, juntaMm: 3, pegoKgPorM2: 5 },
  porcelanato: { m2PorCaja: 1.44, ladoMm: 600, espesorMm: 9, juntaMm: 2, pegoKgPorM2: 6 },
  densidadCarato: 1.6, // kg por litro
} as const;

/** Láminas de techo: largo, ancho que realmente cubre (ya descontado el solape lateral) y solape a lo largo. */
export const TECHO = {
  zinc: { largoM: 3.66, anchoUtilM: 0.7 },
  acerolit: { largoM: 3.66, anchoUtilM: 0.76 },
  solapeLargoM: 0.2,
  tornillosPorM2: 6,
} as const;

/** Impermeabilización. */
export const IMPERMEABILIZACION = {
  solapeMantoM: 0.1, // el rollo mide 1 m de ancho: con 10 cm de solape cubre 9 de sus 10 m²
  primerM2PorGalon: 12,
  acrilicoLitrosPorM2: 1, // total de las dos manos
} as const;

/** Drywall. */
export const DRYWALL = {
  laminaM2: 1.22 * 2.44,
  largoPerfilM: 3.05,
  tornillosPorLamina: 30,
  cintaMPorM2: 1.5,
  masillaKgPorM2: 0.7,
} as const;
