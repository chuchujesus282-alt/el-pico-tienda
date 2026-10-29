import { diaDeHoy } from "@/lib/destacados";

// Rotación diaria de los banners del inicio (responsable: persona A). Lógica pura, sin React: dice qué categoría va
// en cada uno de los 10 lugares; el diseño de cada categoría en cada formato está en
// components/inicio/bannersPorCategoria.tsx.
// - Los 10 lugares forman un anillo (ANILLO). Cada día todas las categorías avanzan PASO lugares: las de vertical3 y
//   vertical4 pasan a central1 y central2. Ciclo de DIAS_CICLO días.
// - El día 0 es ANCLA (en la hora de Caracas, no UTC) y su reparto es INICIAL.
// - Interruptor ROTACION_ACTIVA (variable de entorno): apagado, el inicio se queda siempre con el día 0.
// - ?bannerDay=0..4 fuerza un día para revisarlo, en todo menos producción (VERCEL_ENV !== "production").

export const ANILLO = [
  "central1",
  "central2",
  "central3",
  "central4",
  "horizontal1",
  "horizontal2",
  "vertical1",
  "vertical2",
  "vertical3",
  "vertical4",
] as const;

export type PosicionBanner = (typeof ANILLO)[number];
/** Slug de la categoría que va en cada lugar. */
export type RepartoBanners = Record<PosicionBanner, string>;

/** Reparto del día 0 (ANCLA). */
export const INICIAL: RepartoBanners = {
  central1: "construccion",
  central2: "herramientas",
  central3: "pinturas",
  central4: "cerrajeria",
  horizontal1: "tornilleria",
  horizontal2: "seguridad-industrial",
  vertical1: "electricidad",
  vertical2: "griferia",
  vertical3: "hogar-y-jardin",
  vertical4: "vehiculos",
};

/** Día 0 de la rotación (fecha de Caracas). */
export const ANCLA = "2026-10-29";
export const DIAS_CICLO = 5;
/** Lugares que avanza cada categoría por día. */
export const PASO = 2;

const MS_DIA = 24 * 60 * 60 * 1000;

function diaNumero(ymd: string): number {
  const [anio, mes, dia] = ymd.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia) / MS_DIA;
}

/** Día del ciclo (0 a DIAS_CICLO - 1) de una fecha: días desde ANCLA en Caracas. Antes del ancla también funciona. */
export function indiceDelDia(fecha: Date): number {
  const dias = diaNumero(diaDeHoy(fecha)) - diaNumero(ANCLA);
  return ((dias % DIAS_CICLO) + DIAS_CICLO) % DIAS_CICLO;
}

/** Reparto de un día del ciclo: la categoría que el día 0 está en el lugar p, ese día está en (p + PASO·índice) mod 10. */
export function repartoDelIndice(indice: number): RepartoBanners {
  const n = ANILLO.length;
  return Object.fromEntries(
    ANILLO.map((posicion, q) => [posicion, INICIAL[ANILLO[(((q - PASO * indice) % n) + n) % n]]]),
  ) as RepartoBanners;
}

/** Qué categoría va en cada lugar en esa fecha (con la rotación andando). */
export function getBannerLayout(fecha: Date): RepartoBanners {
  return repartoDelIndice(indiceDelDia(fecha));
}

/**
 * Día del ciclo que se muestra: el forzado con ?bannerDay (si es 0..DIAS_CICLO-1), si no el de la fecha con la
 * rotación encendida, o el 0 con ella apagada.
 */
export function elegirIndice({ fecha, activa, forzado }: { fecha: Date; activa: boolean; forzado?: unknown }): number {
  if (typeof forzado === "string" && /^\d$/.test(forzado) && Number(forzado) < DIAS_CICLO) return Number(forzado);
  return activa ? indiceDelDia(fecha) : 0;
}

/** El interruptor: ROTACION_ACTIVA=true (o 1) enciende la rotación; vacía o cualquier otra cosa, apagada. */
export function rotacionActiva(): boolean {
  return /^(true|1)$/i.test(process.env.ROTACION_ACTIVA ?? "");
}

/** ?bannerDay solo se acepta fuera de producción (en local y en las versiones de prueba de Vercel). */
export function permiteForzarDia(): boolean {
  return process.env.VERCEL_ENV !== "production";
}

/** El reparto separado por formato, en el orden de cada uno. */
export function porFormato(reparto: RepartoBanners) {
  return {
    central: [reparto.central1, reparto.central2, reparto.central3, reparto.central4],
    horizontal: [reparto.horizontal1, reparto.horizontal2],
    vertical: [reparto.vertical1, reparto.vertical2, reparto.vertical3, reparto.vertical4],
  };
}
