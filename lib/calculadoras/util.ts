import { CUARTOS_ANTES_QUE_GALON, MORTERO, PRESENTACION, type MezclaMortero } from "./constantes";
import type { IdMaterial } from "./materiales";
import type { Entrada, LineaMaterial } from "./tipos";

/** Redondea SIEMPRE hacia arriba a unidades de venta enteras (con un margen mínimo para errores de coma flotante). */
export function haciaArriba(valor: number): number {
  return Math.max(0, Math.ceil(valor - 1e-9));
}

/** Número en formato venezolano: coma decimal y punto de miles (ej. 1.234,5). */
export function numero(valor: number, decimales = 2): string {
  return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: decimales }).format(valor);
}

/** Medida escrita por el cliente; las opcionales vacías cuentan como 0. */
export function medida(entrada: Entrada, id: string): number {
  const valor = entrada.medidas[id];
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

/** Área de pared: largo × alto menos puertas y ventanas (nunca negativa). */
export function areaPared(entrada: Entrada): number {
  return Math.max(0, medida(entrada, "largo") * medida(entrada, "alto") - medida(entrada, "vanos"));
}

/**
 * Pintura en galones enteros y cuartos (1/4 de galón): lo que sobra del último galón va en cuartos si cabe en
 * CUARTOS_ANTES_QUE_GALON o menos; si no, sale mejor otro galón. Ej.: 1,3 gal → 1 galón + 2 cuartos; 1,8 → 2 galones.
 */
export function galonesYCuartos(galonesExactos: number): { galones: number; cuartos: number } {
  const totalCuartos = haciaArriba(galonesExactos * 4);
  let galones = Math.floor(totalCuartos / 4);
  let cuartos = totalCuartos % 4;
  if (cuartos > CUARTOS_ANTES_QUE_GALON) {
    galones += 1;
    cuartos = 0;
  }
  return { galones, cuartos };
}

/** Líneas de un producto que se vende en galón y en 1/4 (solo las que llevan cantidad). */
export function lineasGalonCuarto(galonesExactos: number, galon: IdMaterial, cuarto: IdMaterial, nota: string): LineaMaterial[] {
  const { galones, cuartos } = galonesYCuartos(galonesExactos);
  const lineas: LineaMaterial[] = [];
  if (galones > 0) lineas.push({ material: galon, cantidad: galones, nota });
  if (cuartos > 0) lineas.push({ material: cuarto, cantidad: cuartos, nota });
  return lineas;
}

/** Cemento (sacos) y arena (m³) para un volumen de mortero ya con su desperdicio. */
export function materialesMortero(volumenM3: number, mezcla: MezclaMortero): LineaMaterial[] {
  const { cementoKg, arenaM3 } = MORTERO[mezcla];
  const sacos = (volumenM3 * cementoKg) / PRESENTACION.sacoCementoKg;
  const arena = volumenM3 * arenaM3;
  return [
    {
      material: "cemento",
      cantidad: haciaArriba(sacos),
      nota: `${numero(volumenM3, 3)} m³ de mezcla ${mezcla} × ${cementoKg} kg/m³ = ${numero(sacos)} sacos`,
    },
    {
      material: "arena",
      cantidad: haciaArriba(arena),
      nota: `${numero(volumenM3, 3)} m³ de mezcla × ${numero(arenaM3)} = ${numero(arena)} m³`,
    },
  ];
}
